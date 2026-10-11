using System;
using UnityEngine;

// Fabrica de sprites feitos por codigo (estilo Olien: roxo, brilho, laranja).
// Coordenadas: x em [-0.5, 0.5] (largura = 1 unidade), y para cima, na mesma escala.
public static class Art
{
    const int SS = 3; // supersampling para bordas suaves

    public static Color H(string hex)
    {
        ColorUtility.TryParseHtmlString(hex, out var c);
        return c;
    }

    static Material _mat;
    public static Material SpriteMaterial
    {
        get
        {
            if (_mat == null)
            {
                var sh = Shader.Find("Universal Render Pipeline/2D/Sprite-Unlit-Default");
                if (sh == null) sh = Shader.Find("Sprites/Default");
                _mat = new Material(sh);
            }
            return _mat;
        }
    }

    static Sprite _rocket, _flame, _bullet, _dot, _planet, _gradient, _drone, _brute;
    public static Sprite Rocket => _rocket ??= Make(256, 384, RocketPaint);
    public static Sprite Flame => _flame ??= Make(128, 192, FlamePaint);
    public static Sprite Bullet => _bullet ??= Make(48, 144, BulletPaint);
    public static Sprite Dot => _dot ??= Make(64, 64, DotPaint);
    public static Sprite Planet => _planet ??= Make(512, 300, PlanetPaint);
    public static Sprite Gradient => _gradient ??= Make(4, 256, GradientPaint);
    public static Sprite Drone => _drone ??= Make(128, 128, (x, y) => EnemyPaint(x, y, H("#ffd37a"), H("#ff7a1a")));
    public static Sprite Brute => _brute ??= Make(128, 128, (x, y) => EnemyPaint(x, y, H("#ff9ad0"), H("#c2185b")));

    // ---------- util ----------
    static Color Over(Color under, Color over)
    {
        float a = over.a + under.a * (1f - over.a);
        if (a <= 0f) return Color.clear;
        float k = under.a * (1f - over.a);
        return new Color(
            (over.r * over.a + under.r * k) / a,
            (over.g * over.a + under.g * k) / a,
            (over.b * over.a + under.b * k) / a,
            a);
    }

    static Color A(Color c, float a) { c.a = a; return c; }

    static float Sign(float px, float py, float ax, float ay, float bx, float by)
        => (px - bx) * (ay - by) - (ax - bx) * (py - by);

    static bool InTri(float px, float py, float ax, float ay, float bx, float by, float cx, float cy)
    {
        float d1 = Sign(px, py, ax, ay, bx, by);
        float d2 = Sign(px, py, bx, by, cx, cy);
        float d3 = Sign(px, py, cx, cy, ax, ay);
        bool neg = d1 < 0 || d2 < 0 || d3 < 0;
        bool pos = d1 > 0 || d2 > 0 || d3 > 0;
        return !(neg && pos);
    }

    static Sprite Make(int w, int h, Func<float, float, Color> paint)
    {
        var tex = new Texture2D(w, h, TextureFormat.RGBA32, false)
        {
            filterMode = FilterMode.Bilinear,
            wrapMode = TextureWrapMode.Clamp
        };
        var px = new Color32[w * h];
        int n = SS * SS;
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                float sr = 0, sg = 0, sb = 0, sa = 0;
                for (int sy = 0; sy < SS; sy++)
                {
                    for (int sx = 0; sx < SS; sx++)
                    {
                        float fx = (x + (sx + 0.5f) / SS) / w - 0.5f;
                        float fy = (y + (sy + 0.5f) / SS) / w;
                        var c = paint(fx, fy);
                        sr += c.r * c.a; sg += c.g * c.a; sb += c.b * c.a; sa += c.a;
                    }
                }
                if (sa > 0f)
                    px[y * w + x] = new Color(sr / sa, sg / sa, sb / sa, sa / n);
                else
                    px[y * w + x] = new Color32(0, 0, 0, 0);
            }
        }
        tex.SetPixels32(px);
        tex.Apply(false, true);
        return Sprite.Create(tex, new Rect(0, 0, w, h), new Vector2(0.5f, 0.5f), w);
    }

    // ---------- foguete do Olienzinho ----------
    static float BodyHW(float y)
    {
        if (y <= 0.8f) return 0.2f - (0.8f - y) * 0.04f;
        float t = (y - 0.8f) / 0.65f;
        return 0.2f * Mathf.Sqrt(Mathf.Max(0f, 1f - t * t));
    }

    static Color RocketPaint(float x, float y)
    {
        Color c = Color.clear;
        float ax = Mathf.Abs(x);

        // aletas
        if (InTri(ax, y, 0.15f, 0.78f, 0.44f, 0.25f, 0.15f, 0.30f))
            c = Over(c, Color.Lerp(H("#4a22a8"), H("#6d3ad8"), Mathf.Clamp01((y - 0.25f) / 0.5f)));

        // bocal
        if (ax < 0.085f && y > 0.17f && y < 0.27f)
            c = Over(c, H("#3f2290"));

        // corpo
        float hw = BodyHW(y);
        if (y >= 0.25f && y < 1.45f && ax < hw)
        {
            float t = (x + hw) / (2f * hw);
            Color bc = t < 0.35f
                ? Color.Lerp(H("#c6a6ff"), H("#9a63ff"), t / 0.35f)
                : Color.Lerp(H("#9a63ff"), H("#5326b8"), (t - 0.35f) / 0.65f);
            c = Over(c, bc);

            // faixa clara
            if (y > 0.50f && y < 0.56f) c = Over(c, A(H("#e2d4ff"), 0.95f));
        }

        // olho
        float d = Mathf.Sqrt(x * x + (y - 0.98f) * (y - 0.98f));
        if (d < 0.125f) c = Over(c, Color.Lerp(H("#f5eeff"), H("#cdb8ff"), Mathf.Clamp01((y - 0.9f) / -0.2f + 0.5f) * 0.5f));
        if (d < 0.088f) c = Over(c, H("#1b0b3d"));
        float hx = x - 0.03f, hy = y - 1.01f;
        if (hx * hx + hy * hy < 0.025f * 0.025f) c = Over(c, Color.white);
        return c;
    }

    static Color FlamePaint(float x, float y)
    {
        float t = (y - 0.1f) / 1.4f;
        if (t < 0f || t > 1f) return Color.clear;
        float hw = 0.26f * Mathf.Pow(t, 0.55f);
        float ax = Mathf.Abs(x);
        if (ax > hw) return Color.clear;
        float k = ax / Mathf.Max(hw, 1e-4f);
        var col = Color.Lerp(H("#fff1c1"), H("#ff8a1f"), Mathf.Clamp01(k * 0.9f + (1f - t) * 0.6f));
        col.a = Mathf.Clamp01(t * 3f) * (1f - k * k * 0.6f);
        return col;
    }

    static Color BulletPaint(float x, float y)
    {
        // segmento vertical de (0,0.5) a (0,2.5)
        float cy = Mathf.Clamp(y, 0.5f, 2.5f);
        float d = Mathf.Sqrt(x * x + (y - cy) * (y - cy));
        Color c = Color.clear;
        float halo = Mathf.Pow(Mathf.Max(0f, 1f - d / 0.22f), 2f) * 0.8f;
        if (halo > 0f) c = A(H("#b98cff"), halo);
        if (d < 0.07f) c = Over(c, Color.white);
        return c;
    }

    static Color DotPaint(float x, float y)
    {
        float d = Mathf.Sqrt(x * x + (y - 0.5f) * (y - 0.5f));
        float a = Mathf.Pow(Mathf.Max(0f, 1f - d / 0.5f), 2f);
        return new Color(1f, 1f, 1f, a);
    }

    static Color EnemyPaint(float x, float y, Color light, Color dark)
    {
        float cy = y - 0.5f;
        float r = Mathf.Sqrt(x * x + cy * cy);
        if (r > 0.42f) return Color.clear;
        float v = cy / 0.42f; // -1 embaixo, 1 em cima
        Color c = Color.Lerp(light, dark, Mathf.Clamp01(0.5f - 0.5f * v));
        if (r > 0.35f) c = Color.Lerp(c, dark * 0.6f, 0.5f);
        if (Mathf.Abs(y - 0.52f) < 0.075f && Mathf.Abs(x) < 0.28f) c = H("#2a0f5e");
        float ex = Mathf.Abs(x) - 0.12f, ey = y - 0.52f;
        if (ex * ex + ey * ey < 0.04f * 0.04f) c = H("#ffe9a8");
        c.a = 1f;
        return c;
    }

    static Color PlanetPaint(float x, float y)
    {
        float cy = y - 0.293f;
        Color c = Color.clear;
        Color ringC = H("#e2d4ff");

        float e = Mathf.Sqrt((x / 0.48f) * (x / 0.48f) + (cy / 0.13f) * (cy / 0.13f));
        bool ring = false;
        if (e > 0.0001f)
        {
            float gx = x / (0.48f * 0.48f * e), gy = cy / (0.13f * 0.13f * e);
            float dist = Mathf.Abs(e - 1f) / Mathf.Sqrt(gx * gx + gy * gy);
            ring = dist < 0.009f;
        }

        if (ring && cy > 0f) c = Over(c, A(ringC, 0.6f));

        float r = Mathf.Sqrt(x * x + cy * cy);
        if (r < 0.28f)
        {
            float lx = x + 0.09f, ly = cy - 0.09f;
            float t = Mathf.Clamp01(Mathf.Sqrt(lx * lx + ly * ly) / 0.38f);
            Color col = t < 0.45f
                ? Color.Lerp(H("#e2d4ff"), H("#8b4dff"), t / 0.45f)
                : Color.Lerp(H("#8b4dff"), H("#3d1290"), (t - 0.45f) / 0.55f);
            col.a = 1f;
            c = Over(c, col);
        }

        if (ring && cy <= 0f) c = Over(c, ringC);
        return c;
    }

    static Color GradientPaint(float x, float y)
    {
        float t = Mathf.Clamp01(y / 64f);
        var c = Color.Lerp(H("#0b0422"), H("#2a1478"), t);
        c.a = 1f;
        return c;
    }
}
