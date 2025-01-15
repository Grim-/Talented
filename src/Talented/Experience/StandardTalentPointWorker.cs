namespace Talented
{
    public class StandardTalentPointWorker : TalentPointFormulaWorker
    {
        public int pointsPerLevel = 1;
        public override int GetTalentPointsForLevel(int previousLevel, int newLevel)
        {
            int levelsGained = newLevel - previousLevel;
            return levelsGained * pointsPerLevel;
        }
    }
}
