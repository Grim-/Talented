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

            if (!IsEffectAppliedTo(pawn))
            {
                Apply(pawn);
            }
        }

        protected virtual void RemoveExistingEffects(Pawn pawn)
        {
            TryRemove(pawn);
        }

        public void TryRemove(Pawn pawn)
        {
            if (IsEffectAppliedTo(pawn))
            {
                Remove(pawn);
            }
            isActive = false;
        }

        protected abstract bool IsEffectAppliedTo(Pawn pawn);
        protected virtual void Apply(Pawn pawn)
        {
            isActive = true;
        }
        protected abstract void Remove(Pawn pawn);

        public virtual void ExposeData()
        {
            Scribe_Values.Look(ref isActive, "isActive");
        }
    }
}
