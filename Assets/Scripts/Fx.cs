using UnityEngine;

// Particulas simples de explosao.
public class Fx : MonoBehaviour
{
    Vector3 vel;
    float life, t, size;
    SpriteRenderer sr;
    Color col;

    public static void Burst(Vector3 pos, Color color, int count, float speed = 3.5f, float size = 0.35f)
    {
        for (int i = 0; i < count; i++)
        {
            var go = new GameObject("fx");
            go.transform.position = pos;
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = Art.Dot;
            sr.sharedMaterial = Art.SpriteMaterial;
            sr.sortingOrder = 6;
            var f = go.AddComponent<Fx>();
            float ang = Random.value * Mathf.PI * 2f;
            f.vel = new Vector3(Mathf.Cos(ang), Mathf.Sin(ang), 0f) * Random.Range(0.4f, 1f) * speed;
            f.life = Random.Range(0.35f, 0.7f);
            f.size = size * Random.Range(0.6f, 1.2f);
            f.sr = sr;
            f.col = color;
        }
    }

    void Update()
    {
        t += Time.deltaTime;
        if (t >= life) { Destroy(gameObject); return; }
        float k = t / life;
        transform.position += vel * Time.deltaTime;
        vel *= 1f - 3f * Time.deltaTime;
        transform.localScale = Vector3.one * size * (1f - k * 0.5f);
        sr.color = new Color(col.r, col.g, col.b, 1f - k);
    }
}
