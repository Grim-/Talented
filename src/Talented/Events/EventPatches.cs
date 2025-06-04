using HarmonyLib;
using RimWorld;
using RimWorld.Planet;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Verse;
using Verse.AI;

namespace Talented
{
    [StaticConstructorOnStartup]
    public static class EventPatches
    {
        static EventPatches()
        {
            var harmony = new Harmony("com.talented.events");
            harmony.PatchAll();
        }

        [HarmonyPatch(typeof(DamageWorker_AddInjury), "ApplyToPawn")]
        public static class Patch_DamageWorker_AddInjury_ApplyToPawn
        {
            public static DamageWorker.DamageResult Postfix(DamageWorker.DamageResult __result, DamageInfo dinfo, Pawn pawn)
            {
                if (Current.ProgramState != ProgramState.Playing) return __result;
                //DebugDamage(__result, dinfo, pawn);
                return EventManager.RaiseDamageDealt(pawn, dinfo.Instigator, dinfo, __result);
            }

            private static void DebugDamage(DamageWorker.DamageResult __result, DamageInfo dinfo, Thing victim)
            {
                Log.Message($"--Combat Hit Debug--");
                Log.Message($"Damage: {dinfo.Amount} | Type: {dinfo.Def?.defName}");
                Log.Message($"Target: {victim?.LabelCap} | Instigator: {dinfo.Instigator?.LabelCap}");
                Log.Message($"InstigatorThing: {dinfo.Instigator?.GetType()?.Name}");
                Log.Message($"Hit Part: {dinfo.HitPart?.def?.defName ?? "null"}");
                Log.Message($"Result damage: {__result?.totalDamageDealt}");
                Log.Message($"Thing Type: {victim?.GetType()?.Name}");
                Log.Message("-------------");
            }
        }

        //# Combat and Defense
        //- Successful melee attacks(Melee skill)
        //- Successful ranged attacks(Shooting skill)
        //- Successfully dodging attacks(Melee skill)
        //- Using shields/blocking(Melee skill)
        //- Taking damage while wearing armor(potential armor skill)

        //# Medical and Social
        //- Successful medicine application(Medicine skill)
        //- Social interactions/negotiations(Social skill)
        //- Successful recruitment attempts(Social skill)
        //- Successful arrest attempts(Social skill)
        //- Tending to wounds without medicine(Medicine skill)
        //- Mental break management(Social skill)

        //# Construction and Crafting
        //- Building completion events(Construction skill)
        //- Item crafting completion(Crafting skill)
        //- Art creation completion(Artistic skill)
        //- Quality level achievements
        //- Deconstruction activities

        //# Research and Intellectual
        //- Research completion events
        //- Scanning/analyzing artifacts
        //- Using study desks/facilities
        //- Teaching other pawns
        //- Reading/studying activities

        //# Natural and Survival
        //- Animal taming success/failure(Animals skill)
        //- Animal training progress(Animals skill)
        //- Successful hunting(Shooting/Melee skills)
        //- Plant harvesting(Plants skill)
        //- Plant sowing(Plants skill)
        //- Successful cooking(Cooking skill)
        //- Mining completion(Mining skill)


        [HarmonyPatch(typeof(Thing), nameof(Thing.TakeDamage))]
        public static class Patch_Thing_TakeDamage
        {
            public static void Prefix(Thing __instance, DamageInfo dinfo)
            {
                if (__instance is Pawn pawn && !pawn.Dead)
                {
                    EventManager.RaiseDamageTaken(pawn, dinfo);
                }
            }
        }

        //[HarmonyPatch(typeof(Pawn), nameof(Pawn.Kill))]
        //public static class Patch_Pawn_Kill
        //{
        //    public static void Prefix(Pawn __instance, DamageInfo dinfo, Hediff exactCulprit)
        //    {
        //        EventManager.RaiseOnKilled(__instance, dinfo, exactCulprit);
        //    }
        //}

        [HarmonyPatch(typeof(Pawn_JobTracker), nameof(Pawn_JobTracker.StartJob))]
        public static class Patch_StartJob
        {
            public static void Prefix(Pawn_JobTracker __instance, Job newJob)
            {
                if (newJob?.def != null && __instance != null)
                {
                    Pawn pawn = Traverse.Create(__instance).Field("pawn").GetValue<Pawn>();
                    if (pawn != null)
                    {
                        EventManager.RaiseJobStarted(pawn, newJob);
                    }
                }
            }
        }

        [HarmonyPatch(typeof(Pawn_JobTracker), nameof(Pawn_JobTracker.EndCurrentJob))]
        public static class Patch_EndJob
        {
            public static void Prefix(Pawn_JobTracker __instance, JobCondition condition)
            {
                if (__instance?.curJob != null)
                {
                    Pawn pawn = Traverse.Create(__instance).Field("pawn").GetValue<Pawn>();
                    if (pawn != null)
                    {
                        EventManager.RaiseJobEnded(pawn, __instance?.curJob, condition);
                    }
                }
            }
        }


        [HarmonyPatch(typeof(Pawn_JobTracker), "CleanupCurrentJob")]
        public static class Patch_CleanupJob
        {
            public static void Prefix(Pawn_JobTracker __instance, JobCondition condition)
            {
                if (__instance?.curJob != null)
                {
                    Pawn pawn = Traverse.Create(__instance).Field("pawn").GetValue<Pawn>();
                    if (pawn != null)
                    {
                        EventManager.RaiseJobCleanedUp(pawn, __instance?.curJob, condition);
                    }
                }
            }
        }

        [HarmonyPatch(typeof(SkillRecord), nameof(SkillRecord.Learn))]
        public static class Patch_SkillRecord_Learn
        {
            public static void Postfix(SkillRecord __instance, float xp, bool direct)
            {
                if (direct && __instance?.Pawn != null)
                {
                    EventManager.RaiseSkillGained(__instance.Pawn, __instance.def, xp);
                }
            }
        }
        [HarmonyPatch(typeof(Ability), nameof(Ability.Activate), new[] { typeof(LocalTargetInfo), typeof(LocalTargetInfo) })]
        public static class Patch_Ability_Activate
        {
            public static void Prefix(Ability __instance)
            {
                if (__instance?.pawn != null)
                {
                    EventManager.RaiseAbilityCast(__instance.pawn, __instance);
                }
            }
        }

        [HarmonyPatch(typeof(Ability), nameof(Ability.Activate), new[] { typeof(GlobalTargetInfo) })]
        public static class Patch_Ability_Activate_Global
        {
            public static void Prefix(Ability __instance)
            {
                if (__instance?.pawn != null)
                {
                    EventManager.RaiseAbilityCast(__instance.pawn, __instance);
                }
            }
        }

        // Patch PreActivate to catch completion
        [HarmonyPatch(typeof(Ability), "PreActivate")]
        public static class Patch_Ability_PreActivate
        {
            public static void Postfix(Ability __instance)
            {
                if (__instance?.pawn != null)
                {
                    EventManager.RaiseAbilityCompleted(__instance.pawn, __instance);
                }
            }
        }

        [HarmonyPatch(typeof(Pawn))]
        [HarmonyPatch("Notify_UsedVerb")]
        public static class Patch_Pawn_UsedVerb
        {
            public static void Postfix(Pawn __instance, Pawn pawn, Verb verb)
            {
                if (pawn != null && verb != null)
                {
                    EventManager.RaiseVerbUsed(pawn, verb);
                }
            }
        }
    }
}
