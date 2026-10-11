using UnityEngine;
using UnityEngine.SceneManagement;

// Monta o jogo sozinho ao apertar Play, sem precisar de objetos na cena.
public static class GameBootstrap
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Init()
    {
        SceneManager.sceneLoaded += (s, m) => Build();
        Build();
    }

    static void Build()
    {
        Enemy.All.Clear();
        Time.timeScale = 1f;
        QualitySettings.vSyncCount = 1;

        var cam = Camera.main;
        if (cam == null)
        {
            var go = new GameObject("Main Camera") { tag = "MainCamera" };
            cam = go.AddComponent<Camera>();
        }
        cam.orthographic = true;
        cam.orthographicSize = View.HalfH;
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Art.H("#0b0422");
        cam.transform.position = new Vector3(0f, 0f, -10f);

        var root = new GameObject("OlienzinhoGame");
        root.AddComponent<Starfield>();
        root.AddComponent<GameManager>();
    }
}
