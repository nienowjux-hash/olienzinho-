using UnityEngine;
using UnityEngine.InputSystem;

public class Player : MonoBehaviour
{
    public float speed = 6.5f;
    public float fireDelay = 0.28f;
    public int damage = 1;
    public int shots = 1;

    float fireT, invuln;
    SpriteRenderer body, flameSr;
    Transform flame;

    public static Player Create()
    {
        var go = new GameObject("Olienzinho");
        go.transform.position = new Vector3(0f, -View.HalfH + 1.8f, 0f);
        var p = go.AddComponent<Player>();

        p.body = go.AddComponent<SpriteRenderer>();
        p.body.sprite = Art.Rocket;
        p.body.sharedMaterial = Art.SpriteMaterial;
        p.body.sortingOrder = 5;

        var f = new GameObject("Chama");
        f.transform.SetParent(go.transform, false);
        f.transform.localPosition = new Vector3(0f, -0.84f, 0f);
        f.transform.localScale = Vector3.one * 0.45f;
        p.flameSr = f.AddComponent<SpriteRenderer>();
        p.flameSr.sprite = Art.Flame;
        p.flameSr.sharedMaterial = Art.SpriteMaterial;
        p.flameSr.sortingOrder = 4;
        p.flame = f.transform;
        return p;
    }

    void Update()
    {
        float dt = Time.deltaTime;
        var kb = Keyboard.current;
        Vector2 m = Vector2.zero;
        if (kb != null)
        {
            if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) m.x -= 1f;
            if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) m.x += 1f;
            if (kb.sKey.isPressed || kb.downArrowKey.isPressed) m.y -= 1f;
            if (kb.wKey.isPressed || kb.upArrowKey.isPressed) m.y += 1f;
        }
        m = Vector2.ClampMagnitude(m, 1f);

        var p = transform.position + (Vector3)(m * speed * dt);
        float mx = View.HalfW - 0.7f, my = View.HalfH - 0.9f;
        p.x = Mathf.Clamp(p.x, -mx, mx);
        p.y = Mathf.Clamp(p.y, -my, my);
        transform.position = p;

        float tilt = -m.x * 14f;
        transform.rotation = Quaternion.Lerp(transform.rotation, Quaternion.Euler(0, 0, tilt), 12f * dt);

        float boost = m.y > 0f ? 0.35f : (m.y < 0f ? -0.25f : 0f);
        float n = Mathf.PerlinNoise(Time.time * 30f, 0f);
        flame.localScale = new Vector3(0.45f * (0.9f + 0.2f * n), 0.45f * (0.85f + 0.35f * n + boost), 1f);

        fireT -= dt;
        if (fireT <= 0f)
        {
            Shoot();
            fireT = fireDelay;
        }

        if (invuln > 0f)
        {
            invuln -= dt;
            bool on = Mathf.FloorToInt(invuln * 14f) % 2 == 0;
            body.color = on ? new Color(1f, 1f, 1f, 0.35f) : Color.white;
            if (invuln <= 0f) body.color = Color.white;
        }
    }

    void Shoot()
    {
        for (int i = 0; i < shots; i++)
        {
            float k = i - (shots - 1) * 0.5f;
            var dir = Quaternion.Euler(0, 0, -k * 5f) * Vector3.up;
            Bullet.Spawn(transform.position + new Vector3(k * 0.28f, 0.7f, 0f), dir, damage);
        }
    }

    public void Hit()
    {
        if (invuln > 0f) return;
        invuln = 1.3f;
        Fx.Burst(transform.position, Art.H("#e2d4ff"), 12);
        GameManager.I.Damage(1);
    }
}
