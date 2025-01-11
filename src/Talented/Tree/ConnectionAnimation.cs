using RimWorld;
using UnityEngine;
using Verse;

namespace Talented
{
    public class ConnectionAnimation : UIAnimationState
    {
        public Vector2 startPos;
        public Vector2 endPos;
        public Color color;
        public float ConnectionThickness;

        public override bool Finished => Progress >= 1f;

        public override void Animate()
        {
            Vector2 currentEnd = Vector2.Lerp(startPos, endPos, Progress);
            Widgets.DrawLine(startPos, currentEnd, color, ConnectionThickness);
        }
    }
}
