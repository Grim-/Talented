namespace Talented
{
    public class LinearExperienceFormula : ExperienceFormulaWorker
    {
        public override float GetExperienceForLevel(int Level)
        {
            return (Level + 1) * Def.baseExperience;
        }
    }
}
