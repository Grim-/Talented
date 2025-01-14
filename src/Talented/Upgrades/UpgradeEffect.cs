using System.Text;
using System.Threading.Tasks;
using Verse;

namespace Talented
{
    public abstract class UpgradeEffect : IExposable
    {
        protected bool isActive = false;

        public bool IsActive => isActive;

        public void TryApply(Pawn pawn, bool sequential = false)
        {
            if (sequential)
            {
                RemoveExistingEffects(pawn);
            }

            if (!IsEffectPresent(pawn))
            {
                Apply(pawn);
            }
            isActive = true;
        }

        protected virtual void RemoveExistingEffects(Pawn pawn)
        {
            TryRemove(pawn);
        }

        public void TryRemove(Pawn pawn)
        {
            if (IsEffectPresent(pawn))
            {
                Remove(pawn);
            }
            isActive = false;
        }

        protected abstract bool IsEffectPresent(Pawn pawn);
        protected abstract void Apply(Pawn pawn);
        protected abstract void Remove(Pawn pawn);

        public virtual void ExposeData()
        {
            Scribe_Values.Look(ref isActive, "isActive");
        }
    }
}
