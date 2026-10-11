using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    public static readonly List<Enemy> All = new List<Enemy>();

    public float radius = 0.38f;
    int hp, xp, score;
    float speed, baseX, amp, freq, phase, spin, flash, age;
    bool brute;
    SpriteRenderer sr;
    Color burstColor;

    public static void Spawn(bool isBrute, float x, int wave)
    {
        var go = new GameObject(isBrute ? "Bruto" : "Zangao");
        go.transform.position = new Vector3(x, View.HalfH + 1f, 0f);
        var e = go.AddComponent<Enemy>();
        e.brute = isBrute;
        e.sr = go.AddComponent<SpriteRenderer>();
        e.sr.sprite = isBrute ? Art.Brute : Art.Drone;
        e.sr.sharedMaterial = Art.SpriteMaterial;
        e.sr.sortingOrder = 3;
        e.baseX = x;
        e.phase = Random.value * 6.28f;
        if (isBrute)
        {
            go.transform.localScale = Vector3.one * 1.45f;
            e.radius = 0.58f;
            e.hp = 6 + wave;
            e.speed = 1.1f + wave * 0.04f;
            e.amp = 0.6f; e.freq = 0.9f;
            e.xp = 4; e.score = 50;
            e.burstColor = Art.H("#ff7ab8");
        }
        else
        {
            go.transform.localScale = Vector3.one * 0.9f;
            e.radius = 0.38f;
            e.hp = 1 + wave / 3;
            e.speed = 1.8f + wave * 0.08f;
            e.amp = Random.Range(0.5f, 1.6f); e.freq = Random.Range(1f, 2f);
            e.xp = 1; e.score = 10;
            e.burstColor = Art.H("#ffb340");
        }
        e.spin = Random.Range(-30f, 30f);
    }

    void OnEnable() { All.Add(this); }
    void OnDisable() { All.Remove(this); }

    void Update()
    {
        float dt = Time.deltaTime;
        age += dt;
        var p = transform.position;
        p.y -= speed * dt;
        p.x = baseX + Mathf.Sin(age * freq + phase) * amp;
        transform.position = p;
        transform.Rotate(0, 0, spin * dt);

        if (flash > 0f)
        {
            flash -= dt;
            sr.color = new Color(1f, 0.55f, 0.55f);
        }
        else sr.color = Color.white;

        if (p.y < -View.HalfH - 1.5f) { Destroy(gameObject); return; }

        var gm = GameManager.I;
        if (gm != null && gm.player != null)
        {
            float r = radius + 0.3f;
            if (((Vector2)(gm.player.transform.position - p)).sqrMagnitude < r * r)
            {
                gm.player.Hit();
                Die(false);
            }
        }
    }

    public void Damage(int d)
    {
        hp -= d;
        flash = 0.08f;
        if (hp <= 0) Die(true);
    }

    void Die(bool reward)
    {
        Fx.Burst(transform.position, burstColor, brute ? 16 : 9);
        if (reward && GameManager.I != null) GameManager.I.OnKill(xp, score);
        Destroy(gameObject);
    }
}
