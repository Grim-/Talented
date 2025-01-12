namespace Talented
{
    public class PeriodicTalentPointWorker : TalentPointFormulaWorker
    {
        public int pointsPerPeriod = 1;
        public int levelPeriod = 5;

        public override int GetTalentPointsForLevel(int levelsGained)
        {
            return (levelsGained / levelPeriod) * pointsPerPeriod;
        }
    }
}
