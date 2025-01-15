namespace Talented
{
    public class PeriodicTalentPointWorker : TalentPointFormulaWorker
    {
        public int pointsPerPeriod = 1;
        public int levelPeriod = 5;

        public override int GetTalentPointsForLevel(int previousLevel, int newLevel)
        {
            int previousThresholds = previousLevel / levelPeriod;
            int currentThresholds = newLevel / levelPeriod;

            return (currentThresholds - previousThresholds) * pointsPerPeriod;
        }
    }
}
