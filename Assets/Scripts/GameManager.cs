using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager I;

    public Player player;
    public int hp = 5, maxHp = 5, level = 1, xp, score, wave = 1, kills;
    public bool gameOver, choosing;

    float spawnT = 1.2f;
    readonly List<Upgrade> options = new List<Upgrade>();
    readonly List<Upgrade> pool = new List<Upgrade>();
    int pendingLevelUps;

    class Upgrade
    {
        public string name, desc;
        public Action apply;
    }

    void Awake()
    {
        I = this;
        Time.timeScale = 1f;
    }

    void Start()
    {
        player = Player.Create();
        BuildPool();
    }

    int NeedXp => 4 + level * 3;

    // ---------- regras ----------
    void BuildPool()
    {
        pool.Add(new Upgrade { name = "Tiro forte", desc = "+1 de dano por tiro", apply = () => player.damage += 1 });
        pool.Add(new Upgrade { name = "Cadencia", desc = "Atira 18% mais rapido", apply = () => player.fireDelay = Mathf.Max(0.07f, player.fireDelay * 0.82f) });
        pool.Add(new Upgrade { name = "Tiro multiplo", desc = "+1 tiro em leque (max 5)", apply = () => player.shots = Mathf.Min(5, player.shots + 1) });
        pool.Add(new Upgrade { name = "Propulsor", desc = "+15% de velocidade", apply = () => player.speed *= 1.15f });
        pool.Add(new Upgrade { name = "Casco reforcado", desc = "+1 de vida maxima e cura 1", apply = () => { maxHp++; hp = Mathf.Min(maxHp, hp + 1); } });
        pool.Add(new Upgrade { name = "Reparo", desc = "Recupera 2 de vida", apply = () => hp = Mathf.Min(maxHp, hp + 2) });
    }

    public void OnKill(int gainXp, int gainScore)
    {
        score += gainScore;
        xp += gainXp;
        kills++;
        if (kills % 12 == 0) wave++;
        while (xp >= NeedXp)
        {
            xp -= NeedXp;
            level++;
            pendingLevelUps++;
        }
        if (pendingLevelUps > 0 && !choosing) OpenUpgrade();
    }

    void OpenUpgrade()
    {
        pendingLevelUps--;
        choosing = true;
        options.Clear();
        var tmp = new List<Upgrade>(pool);
        for (int i = 0; i < 3 && tmp.Count > 0; i++)
        {
            int k = UnityEngine.Random.Range(0, tmp.Count);
            options.Add(tmp[k]);
            tmp.RemoveAt(k);
        }
        Time.timeScale = 0f;
    }

    void Choose(int i)
    {
        if (i < 0 || i >= options.Count) return;
        options[i].apply();
        choosing = false;
        Time.timeScale = 1f;
        if (pendingLevelUps > 0) OpenUpgrade();
    }

    public void Damage(int d)
    {
        hp -= d;
        if (hp <= 0)
        {
            hp = 0;
            gameOver = true;
            Fx.Burst(player.transform.position, Art.H("#b98cff"), 30, 5f, 0.5f);
            Destroy(player.gameObject);
            Time.timeScale = 0f;
        }
    }

    void SpawnOne(float x)
    {
        bool brute = wave >= 3 && UnityEngine.Random.value < Mathf.Min(0.3f, wave * 0.04f);
        Enemy.Spawn(brute, x, wave);
    }

    void Update()
    {
        var kb = Keyboard.current;

        if (gameOver)
        {
            if (kb != null && kb.rKey.wasPressedThisFrame)
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
            return;
        }

        if (choosing)
        {
            if (kb != null)
            {
                if (kb.digit1Key.wasPressedThisFrame) Choose(0);
                else if (kb.digit2Key.wasPressedThisFrame) Choose(1);
                else if (kb.digit3Key.wasPressedThisFrame) Choose(2);
            }
            return;
        }

        spawnT -= Time.deltaTime;
        if (spawnT <= 0f)
        {
            float hw = View.HalfW - 1f;
            if (wave >= 2 && UnityEngine.Random.value < 0.25f)
            {
                int n = UnityEngine.Random.Range(3, 6);
                float cx = UnityEngine.Random.Range(-hw + 2f, hw - 2f);
                for (int i = 0; i < n; i++) SpawnOne(cx + (i - (n - 1) * 0.5f) * 1.3f);
            }
            else SpawnOne(UnityEngine.Random.Range(-hw, hw));
            spawnT = Mathf.Max(0.4f, 1.3f - wave * 0.07f);
        }
    }

    // ---------- HUD ----------
    GUIStyle label, big, small;
    Texture2D white => Texture2D.whiteTexture;

    void Box(Rect r, Color c)
    {
        var o = GUI.color;
        GUI.color = c;
        GUI.DrawTexture(r, white);
        GUI.color = o;
    }

    void MakeStyles(float s)
    {
        if (label == null)
        {
            label = new GUIStyle(GUI.skin.label) { fontStyle = FontStyle.Bold };
            big = new GUIStyle(label) { alignment = TextAnchor.MiddleCenter };
            small = new GUIStyle(label) { alignment = TextAnchor.UpperCenter, wordWrap = true, fontStyle = FontStyle.Normal };
        }
        label.fontSize = Mathf.RoundToInt(26 * s);
        big.fontSize = Mathf.RoundToInt(64 * s);
        small.fontSize = Mathf.RoundToInt(22 * s);
        label.normal.textColor = big.normal.textColor = small.normal.textColor = Art.H("#e2d4ff");
    }

    void OnGUI()
    {
        float s = Screen.height / 1080f;
        float W = Screen.width, Hh = Screen.height;
        MakeStyles(s);

        // barra de XP
        Box(new Rect(0, 0, W, 10 * s), new Color(1, 1, 1, 0.12f));
        Box(new Rect(0, 0, W * Mathf.Clamp01(xp / (float)NeedXp), 10 * s), Art.H("#8b4dff"));

        // vida
        label.alignment = TextAnchor.UpperLeft;
        GUI.Label(new Rect(24 * s, 22 * s, 400 * s, 40 * s), "NIVEL " + level, label);
        for (int i = 0; i < maxHp; i++)
        {
            var r = new Rect((24 + i * 44) * s, 68 * s, 36 * s, 14 * s);
            Box(r, i < hp ? Art.H("#ff5f8f") : new Color(1, 1, 1, 0.15f));
        }

        label.alignment = TextAnchor.UpperCenter;
        GUI.Label(new Rect(W * 0.5f - 200 * s, 22 * s, 400 * s, 40 * s), "ONDA " + wave, label);
        label.alignment = TextAnchor.UpperRight;
        GUI.Label(new Rect(W - 424 * s, 22 * s, 400 * s, 40 * s), score + " pts", label);

        if (choosing)
        {
            Box(new Rect(0, 0, W, Hh), new Color(0.04f, 0.01f, 0.13f, 0.75f));
            GUI.Label(new Rect(0, Hh * 0.14f, W, 100 * s), "SUBIU DE NIVEL!", big);
            float cw = 380 * s, ch = 240 * s, gap = 40 * s;
            float x0 = W * 0.5f - (cw * 3 + gap * 2) * 0.5f, y0 = Hh * 0.38f;
            for (int i = 0; i < options.Count; i++)
            {
                var r = new Rect(x0 + i * (cw + gap), y0, cw, ch);
                bool hover = r.Contains(Event.current.mousePosition);
                Box(r, hover ? Art.H("#5b2fc0") : Art.H("#2f1782"));
                Box(new Rect(r.x, r.y, r.width, 6 * s), Art.H("#ffb340"));
                label.alignment = TextAnchor.UpperCenter;
                GUI.Label(new Rect(r.x, r.y + 28 * s, r.width, 40 * s), (i + 1) + "  " + options[i].name, label);
                GUI.Label(new Rect(r.x + 24 * s, r.y + 100 * s, r.width - 48 * s, ch - 110 * s), options[i].desc, small);
                if (Event.current.type == EventType.MouseDown && hover)
                {
                    Choose(i);
                    Event.current.Use();
                    break;
                }
            }
            small.alignment = TextAnchor.UpperCenter;
            GUI.Label(new Rect(0, y0 + ch + 40 * s, W, 40 * s), "Clique ou aperte 1, 2 ou 3", small);
        }

        if (gameOver)
        {
            Box(new Rect(0, 0, W, Hh), new Color(0.04f, 0.01f, 0.13f, 0.75f));
            GUI.Label(new Rect(0, Hh * 0.3f, W, 100 * s), "FIM DE JOGO", big);
            GUI.Label(new Rect(0, Hh * 0.3f + 110 * s, W, 50 * s), "Nivel " + level + "  -  Onda " + wave + "  -  " + score + " pts", small);
            GUI.Label(new Rect(0, Hh * 0.3f + 170 * s, W, 50 * s), "Aperte R para jogar de novo", small);
        }
    }
}
