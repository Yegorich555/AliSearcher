using System;

namespace Engine.Entity
{
    public static class ExceptionCatch
    {
        public static event EventHandler Setted;
        public static void Set(string message)
        {
            Setted?.Invoke(message, EventArgs.Empty);
        }
    }
}
