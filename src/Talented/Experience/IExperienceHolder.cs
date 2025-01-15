namespace Talented
{
    public interface IExperienceHolder
    {
        float CurrentExperience { get; }
        float XPForNextLevel { get; }
        float ExperienceProgress { get; }
    }
}
