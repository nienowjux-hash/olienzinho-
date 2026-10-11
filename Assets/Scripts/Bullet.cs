using UnityEngine;

public class Bullet : MonoBehaviour
{
    Vector2 vel;
    int dmg;

    public static void Spawn(Vector3 pos, Vector2 dir, int damage)
    {
        var go = new GameObject("Tiro");
        go.transform.position = pos;
        go.transform.rotation = Quaternion.FromToRotation(Vector3.up, dir);
        go.transform.localScale = Vector3.one * 0.35f;
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = Art.Bullet;
        sr.sharedMaterial = Art.SpriteMaterial;
        sr.sortingOrder = 2;
        var b = go.AddComponent<Bullet>();
        b.vel = dir.normalized * 15f;
        b.dmg = damage;
    }

    void Update()
    {
        transform.position += (Vector3)(vel * Time.deltaTime);
        var p = transform.position;
        if (p.y > View.HalfH + 1f || p.y < -View.HalfH - 1f || Mathf.Abs(p.x) > View.HalfW + 1f)
        {
            Destroy(gameObject);
            return;
        }

        for (int i = Enemy.All.Count - 1; i >= 0; i--)
        {
            var e = Enemy.All[i];
            if (((Vector2)(e.transform.position - p)).sqrMagnitude < (e.radius + 0.15f) * (e.radius + 0.15f))
            {
                e.Damage(dmg);
                Destroy(gameObject);
                return;
            }
        }
    }
}
