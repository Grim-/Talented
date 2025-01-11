using UnityEngine;

namespace Talented
{
    public class UIAnimationState
    {
        public float startTime;
        public float duration;
        public float Progress => Mathf.Clamp01((Time.time - startTime) / duration);

        public virtual bool Finished => false;
        public virtual void Animate() { }
    }
}
