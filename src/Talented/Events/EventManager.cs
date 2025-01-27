using RimWorld;
using System;
using System.Collections.Generic;
using Verse;
using Verse.AI;

namespace Talented
{
    public class EventManager : GameComponent
    {
        private static EventManager instance;
        public static EventManager Instance => instance;

        private struct QueuedEvent
        {
            public Action Action { get; }
            public int Frame { get; }

            public QueuedEvent(Action action, int frame)
            {
                Action = action;
                Frame = frame;
            }
        }

        private Queue<QueuedEvent> eventQueue = new Queue<QueuedEvent>();
        private readonly object queueLock = new object();

        // Combat events
        public static event Func<Thing, Thing, DamageInfo, DamageWorker.DamageResult, DamageWorker.DamageResult> OnDamageDealt;
        public static event Action<Pawn, DamageInfo> OnDamageTaken;

        // Work events
        public static event Action<Pawn, WorkTypeDef, float> OnWorkCompleted;
        public static event Action<Pawn, SkillDef, float> OnSkillGained;

        // Ability events
        public static event Action<Pawn, Verb> OnVerbUsed;
        public static event Action<Pawn, Ability> OnAbilityCast;
        public static event Action<Pawn, Ability> OnAbilityCompleted;

        // Job events
        public static event Action<Pawn, Job> OnJobStarted;
        public static event Action<Pawn, Job, int> OnJobProgress;
        public static event Action<Pawn, Job, JobCondition> OnJobEnded;
        public static event Action<Pawn, Job, JobCondition> OnJobCleanedUp;
        public EventManager(Game game) : base()
        {
            instance = this;
        }

        public override void GameComponentTick()
        {
            base.GameComponentTick();
            ProcessEvents();
        }

        private void ProcessEvents()
        {
            lock (queueLock)
            {
                while (eventQueue.Count > 0 &&
                       eventQueue.Peek().Frame <= Current.Game.tickManager.TicksGame)
                {
                    var evt = eventQueue.Dequeue();
                    try
                    {
                        evt.Action();
                    }
                    catch (Exception ex)
                    {
                        Log.Error($"Talented EventManager: Error processing event: {ex}");
                    }
                }
            }
        }

        //cant queue this, needs to respond immediately with the value.
        public static DamageWorker.DamageResult RaiseDamageDealt(Thing target, Thing attacker, DamageInfo dinfo, DamageWorker.DamageResult baseResult)
        {
            return OnDamageDealt?.Invoke(target, attacker, dinfo, baseResult) ?? baseResult;
        }

        public static void RaiseDamageTaken(Pawn target, DamageInfo info)
        {
            if (OnDamageTaken == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnDamageTaken?.Invoke(target, info),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseWorkCompleted(Pawn pawn, WorkTypeDef workType, float value)
        {
            if (OnWorkCompleted == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnWorkCompleted?.Invoke(pawn, workType, value),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseSkillGained(Pawn pawn, SkillDef skill, float xp)
        {
            if (OnSkillGained == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnSkillGained?.Invoke(pawn, skill, xp),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }
        public static void RaiseVerbUsed(Pawn pawn, Verb verb)
        {
            if (OnAbilityCompleted == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnVerbUsed?.Invoke(pawn, verb),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }
        public static void RaiseAbilityCast(Pawn pawn, Ability ability)
        {
            if (OnAbilityCast == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnAbilityCast?.Invoke(pawn, ability),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseAbilityCompleted(Pawn pawn, Ability ability)
        {
            if (OnAbilityCompleted == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnAbilityCompleted?.Invoke(pawn, ability),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseJobStarted(Pawn pawn, Job job)
        {
            if (OnJobStarted == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnJobStarted?.Invoke(pawn, job),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseJobProgress(Pawn pawn, Job job, int toilIndex)
        {
            if (OnJobProgress == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnJobProgress?.Invoke(pawn, job, toilIndex),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseJobEnded(Pawn pawn, Job job, JobCondition condition)
        {
            if (OnJobEnded == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnJobEnded?.Invoke(pawn, job, condition),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }

        public static void RaiseJobCleanedUp(Pawn pawn, Job job, JobCondition condition)
        {
            if (OnJobCleanedUp == null) return;

            lock (Instance.queueLock)
            {
                Instance.eventQueue.Enqueue(new QueuedEvent(
                    () => OnJobCleanedUp?.Invoke(pawn, job, condition),
                    Current.Game.tickManager.TicksGame + 1
                ));
            }
        }


        public override void ExposeData()
        {
            base.ExposeData();

            //no point keep anything that might be in the queue after a reload, if there is anything at all.
            if (Scribe.mode == LoadSaveMode.LoadingVars)
            {
                eventQueue.Clear();
            }
        }
    }
}
