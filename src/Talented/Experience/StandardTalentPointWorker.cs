namespace Talented
{
    public class StandardTalentPointWorker : TalentPointFormulaWorker
    {
        public override int GetTalentPointsForLevel(int levels)
        {
            return levels;
        }
    }
}
