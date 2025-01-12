namespace Talented
{
    public abstract class ExperienceFormulaWorker
    {
        public ExperienceFormulaDef Def;
        public abstract float GetExperienceForLevel(int Level);
    }
}
