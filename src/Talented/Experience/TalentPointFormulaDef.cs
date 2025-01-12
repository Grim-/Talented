using System;
using Verse;

namespace Talented
{
    public class TalentPointFormulaDef : Def
    {
        public Type talentPointWorkerClass;
        public int pointsPerPeriod = 2;
        public int levelPeriod = 5;

        public TalentPointFormulaWorker CreateWorker()
        {
            return (TalentPointFormulaWorker)Activator.CreateInstance(talentPointWorkerClass);
        }
    }

}
