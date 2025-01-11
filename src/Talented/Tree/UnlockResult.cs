namespace Talented
{
    public class UnlockResult
    {
        public bool Success { get; }
        public UpgradeUnlockError Error { get; }
        public string Message { get; }

        private UnlockResult(bool success, UpgradeUnlockError error, string message)
        {
            Success = success;
            Error = error;
            Message = message;
        }

        public static UnlockResult Succeeded()
            => new UnlockResult(true, UpgradeUnlockError.None, string.Empty);

        public static UnlockResult Failed(UpgradeUnlockError error, string message)
            => new UnlockResult(false, error, message);
    }
}
