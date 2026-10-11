using UnityEngine;

public static class View
{
    public const float HalfH = 6f;

    public static float HalfW
    {
        get
        {
            var c = Camera.main;
            return HalfH * (c != null ? c.aspect : 16f / 9f);
        }
    }
}
