namespace Talented
{

    //[StaticConstructorOnStartup]
    //public static class GizmoGridPager
    //{
    //    private static int currentPage = 0;
    //    private static int itemsPerPage = 8;
    //    public static float ButtonSize = 30;

    //    private static Texture2D ArrowLeft => ContentFinder<Texture2D>.Get("ArrowLeft");
    //    private static Texture2D ArrowRight => ContentFinder<Texture2D>.Get("ArrowRight");

    //    static GizmoGridPager()
    //    {
    //        var harmony = new Harmony("test.mod.pageableabilitygizmogrid");
    //        harmony.Patch(
    //            original: AccessTools.Method(typeof(GizmoGridDrawer), "DrawGizmoGrid"),
    //            prefix: new HarmonyMethod(typeof(GizmoGridPager), nameof(GizmoGridPatchPrefix))
    //        );
    //    }
    //    public static bool GizmoGridPatchPrefix(ref IEnumerable<Gizmo> gizmos, float startX, out Gizmo mouseoverGizmo,
    //        Func<Gizmo, bool> customActivatorFunc, Func<Gizmo, bool> highlightFunc, Func<Gizmo, bool> lowlightFunc, bool multipleSelected)
    //    {
    //        mouseoverGizmo = null;
    //        if (Event.current.type == EventType.Layout)
    //            return true;

    //        var gizmoList = gizmos.ToList();

    //        var stickyGizmos = gizmoList
    //            .Where(g => g is Command_Ability cmd && cmd.IsSticky())
    //            .OrderBy(g => gizmoList.IndexOf(g))
    //            .ToList();


    //        var normalGizmos = gizmoList
    //            .Where(g => !(g is Command_Ability cmd && cmd.IsSticky()))
    //            .ToList();

    //        if (normalGizmos.Count <= itemsPerPage)
    //        {
    //            currentPage = 0;
    //            gizmos = stickyGizmos.Concat(normalGizmos);
    //            return true;
    //        }

    //        int totalPages = (int)Math.Ceiling(normalGizmos.Count / (float)itemsPerPage);
    //        currentPage = Math.Min(currentPage, totalPages - 1);

    //        var allGizmos = new List<Gizmo>();


    //        if (currentPage > 0)
    //        {
    //            allGizmos.Add(new Command_Action
    //            {
    //                defaultLabel = $"◄ {currentPage}",
    //                defaultDesc = "Previous page",
    //                action = () => currentPage--,
    //                Order = -1000,
    //                icon = ArrowLeft
    //            });
    //        }


    //        allGizmos.AddRange(stickyGizmos);


    //        allGizmos.AddRange(normalGizmos
    //            .Skip(currentPage * itemsPerPage)
    //            .Take(itemsPerPage));

    //        if (currentPage < totalPages - 1)
    //        {
    //            allGizmos.Add(new Command_Action
    //            {
    //                defaultLabel = $"► {currentPage}",
    //                defaultDesc = "Next page",
    //                action = () => currentPage++,
    //                Order = 1000,
    //                icon = ArrowRight
    //            });
    //        }

    //        gizmos = allGizmos;
    //        return true;
    //    }
    //    public static void Reset()
    //    {
    //        currentPage = 0;
    //    }
    //}

    //public static class Command_StickyStorage
    //{
    //    private static readonly Dictionary<string, HashSet<AbilityDef>> stickyAbilities =
    //        new Dictionary<string, HashSet<AbilityDef>>();

    //    public static bool IsSticky(this Command command)
    //    {
    //        if (!(command is Command_Ability abilityCommand))
    //            return false;

    //        var pawn = abilityCommand.Pawn;
    //        if (pawn?.Faction != Faction.OfPlayer)
    //        {
    //            ClearPawn(pawn.ThingID);
    //            return false;
    //        }

    //        string pawnId = pawn.ThingID;
    //        if (!stickyAbilities.TryGetValue(pawnId, out var stickySet))
    //            return false;

    //        return stickySet.Contains(abilityCommand.Ability.def);
    //    }

    //    public static void SetSticky(this Command command, bool value)
    //    {
    //        if (!(command is Command_Ability abilityCommand))
    //            return;

    //        if (abilityCommand.Pawn?.Faction != Faction.OfPlayer)
    //            return;

    //        string pawnId = abilityCommand.Pawn.ThingID;

    //        if (value)
    //        {
    //            if (!stickyAbilities.TryGetValue(pawnId, out var stickySet))
    //            {
    //                stickySet = new HashSet<AbilityDef>();
    //                stickyAbilities[pawnId] = stickySet;
    //            }
    //            stickySet.Add(abilityCommand.Ability.def);
    //        }
    //        else
    //        {
    //            if (stickyAbilities.TryGetValue(pawnId, out var stickySet))
    //            {
    //                stickySet.Remove(abilityCommand.Ability.def);
    //                if (stickySet.Count == 0)
    //                    stickyAbilities.Remove(pawnId);
    //            }
    //        }
    //    }

    //    public static void ClearPawn(string pawnId)
    //    {
    //        stickyAbilities.Remove(pawnId);
    //    }
    //}

    //[HarmonyPatch(typeof(Command_Ability))]
    //public class Command_StickyPatch
    //{
    //    [HarmonyPatch(nameof(Command_Ability.GizmoOnGUI))]
    //    static void Prefix(Command_Ability __instance, Vector2 topLeft, float maxWidth, GizmoRenderParms parms)
    //    {
    //        if (__instance.Pawn?.Faction != Faction.OfPlayer)
    //            return;

    //        Rect rect = new Rect(topLeft.x, topLeft.y, __instance.GetWidth(maxWidth), 75f);
    //        Rect checkboxRect = new Rect(rect.x + rect.width - 29f, rect.y + 5f, 24f, 24f);

    //        if (Widgets.ButtonInvisible(checkboxRect))
    //        {
    //            bool isSticky = __instance.IsSticky();
    //            __instance.SetSticky(!isSticky);
    //            Event.current.Use();
    //        }
    //    }

    //    [HarmonyPatch(nameof(Command_Ability.GizmoOnGUI))]
    //    static void Postfix(Command_Ability __instance, Vector2 topLeft, float maxWidth, GizmoRenderParms parms)
    //    {
    //        if (__instance.Pawn?.Faction != Faction.OfPlayer)
    //            return;

    //        Rect rect = new Rect(topLeft.x, topLeft.y, __instance.GetWidth(maxWidth), 75f);
    //        Rect checkboxRect = new Rect(rect.x + rect.width - 29f, rect.y + 5f, 24f, 24f);

    //        bool isSticky = __instance.IsSticky();
    //        Widgets.Checkbox(checkboxRect.position, ref isSticky, 24f, false);
    //    }
    //}
    //[HarmonyPatch(typeof(Command))]
    //[HarmonyPatch("get_GetShrunkSize")] 
    //public class Command_ShrinkPatch
    //{
    //    static void Postfix(Command __instance, ref float __result)
    //    {
    //        if (__instance is Command_Ability)
    //        {
    //            __result = GizmoGridPager.ButtonSize;
    //        }
    //    }
    //}

    //[HarmonyPatch(typeof(Command_Ability))]
    //[HarmonyPatch(MethodType.Constructor, new[] { typeof(Ability), typeof(Pawn) })]
    //public class Command_ShrinkablePatch
    //{
    //    static void Postfix(Command_Ability __instance)
    //    {
    //        __instance.shrinkable = true;
    //    }
    //}
}
