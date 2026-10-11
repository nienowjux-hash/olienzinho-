using System.Collections.Generic;
using UnityEngine;

// Fundo: degrade roxo, estrelas em 3 camadas (parallax) e planetas com anel.
public class Starfield : MonoBehaviour
{
    class Star { public Transform t; public SpriteRenderer sr; public float speed, phase, baseA; }
    class Body { public Transform t; public float speed; }

    readonly List<Star> stars = new List<Star>();
    readonly List<Body> bodies = new List<Body>();

    void Start()
    {
        var bg = new GameObject("Fundo");
        bg.transform.SetParent(transform);
        var bgr = bg.AddComponent<SpriteRenderer>();
        bgr.sprite = Art.Gradient;
        bgr.sharedMaterial = Art.SpriteMaterial;
        bgr.sortingOrder = -100;
        bg.transform.localScale = new Vector3(60f, (View.HalfH * 2f + 2f) / 64f, 1f);

        float w = View.HalfW * 1.6f;
        int[] counts = { 50, 35, 22 };
        float[] speeds = { 0.5f, 1.3f, 2.6f };
        float[] sizes = { 0.07f, 0.12f, 0.2f };
        for (int layer = 0; layer < 3; layer++)
        {
            for (int i = 0; i < counts[layer]; i++)
            {
                var go = new GameObject("Estrela");
                go.transform.SetParent(transform);
                go.transform.position = new Vector3(Random.Range(-w, w), Random.Range(-View.HalfH - 1f, View.HalfH + 1f), 0f);
                go.transform.localScale = Vector3.one * sizes[layer] * Random.Range(0.8f, 1.3f);
                var sr = go.AddComponent<SpriteRenderer>();
                sr.sprite = Art.Dot;
                sr.sharedMaterial = Art.SpriteMaterial;
                sr.sortingOrder = -80 + layer;
                stars.Add(new Star
                {
                    t = go.transform, sr = sr,
                    speed = speeds[layer] * Random.Range(0.9f, 1.1f),
                    phase = Random.value * 6.28f,
                    baseA = 0.4f + layer * 0.25f
                });
            }
        }

        MakePlanet(new Vector3(-View.HalfW * 0.6f, 2.5f, 0f), 3.2f, 0.45f, 0.25f);
        MakePlanet(new Vector3(View.HalfW * 0.7f, -3f, 0f), 2.0f, 0.55f, 0.4f);
    }

    void MakePlanet(Vector3 pos, float size, float alpha, float speed)
    {
        var go = new GameObject("Planeta");
        go.transform.SetParent(transform);
        go.transform.position = pos;
        go.transform.localScale = Vector3.one * size;
        go.transform.rotation = Quaternion.Euler(0, 0, -20f);
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = Art.Planet;
        sr.sharedMaterial = Art.SpriteMaterial;
        sr.sortingOrder = -90;
        sr.color = new Color(1f, 1f, 1f, alpha);
        bodies.Add(new Body { t = go.transform, speed = speed });
    }

    void Update()
    {
        float dt = Time.deltaTime;
        float hw = View.HalfW, hh = View.HalfH;

        foreach (var s in stars)
        {
            var p = s.t.position;
            p.y -= s.speed * dt;
            if (p.y < -hh - 1f)
            {
                p.y = hh + 1f;
                p.x = Random.Range(-hw * 1.1f, hw * 1.1f);
            }
            s.t.position = p;
            float a = s.baseA * (0.65f + 0.35f * Mathf.Sin(Time.time * 2f + s.phase));
            s.sr.color = new Color(0.9f, 0.85f, 1f, a);
        }

        foreach (var b in bodies)
        {
            var p = b.t.position;
            p.y -= b.speed * dt;
            if (p.y < -hh - 3f)
            {
                p.y = hh + 3f;
                p.x = Random.Range(-hw * 0.9f, hw * 0.9f);
            }
            b.t.position = p;
        }
    }
}
