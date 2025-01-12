using System;
using Verse;

namespace Talented
{
    public class ExperienceFormulaDef : Def
    {
        public float baseExperience = 100f;
        public Type experienceWorkerClass;

        public ExperienceFormulaWorker CreateFormulaWorker()
        {
            return (ExperienceFormulaWorker)Activator.CreateInstance(experienceWorkerClass);
        }
    }
}
