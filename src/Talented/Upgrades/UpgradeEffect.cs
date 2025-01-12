using System.Text;
using System.Threading.Tasks;
using Verse;

namespace Talented
{
    public abstract class UpgradeEffect : IExposable
    {
        protected bool isActive = false;

        public void TryApply(Pawn pawn, bool sequential = false)
        {
            if (sequential)
            {
                // For sequential upgrades, always remove existing effects first
                RemoveExistingEffects(pawn);
            }

            if (!IsEffectPresent(pawn))
            {
                Apply(pawn);
            }
            isActive = true;
        }

        // Override this to handle removing any existing effects of the same type
        protected virtual void RemoveExistingEffects(Pawn pawn)
        {
            // Base implementation just does normal remove
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
