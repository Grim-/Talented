using System;
using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class TalentTreeDef : Def
    {
        public string treeName = "A Talent Tree";
        public List<TalentTreeNodeDef> nodes;
        public IntVec2 dimensions;
        public Type handlerClass = typeof(ActiveTreeHandler);
        public TalentTreeSkinDef skin;
        public List<TalentPath> availablePaths;
        public TreeDisplayStrategyDef displayStrategy;

        public TalentPointFormulaDef talentPointFormula;
        private TalentPointFormulaWorker talentPointWorker;

        public TalentPointFormulaWorker TalentPointWorker
        {
            get
            {
                if (talentPointWorker == null && talentPointFormula != null)
                {
                    talentPointWorker = talentPointFormula.CreateWorker();
                }
                return talentPointWorker;
            }
        }

        public TalentTreeNodeDef RootNode
        {
            get
            {
                if (nodes != null && nodes.Count > 0)
                {
                    return nodes[0];
                }

                Log.Error($"Failed to find RootNode for {defName} Talent Tree, UpgradeTreeDefs require atleast 1 node in the nodes list.");
                return null;
            }
        }


        public TalentTreeSkinDef Skin
        {
            get
            {
                if (skin == null)
                {
                    skin = TalentedDefOf.DefaultTreeSkin == null ? DefDatabase<TalentTreeSkinDef>.GetNamed("DefaultTreeSkin") : TalentedDefOf.DefaultTreeSkin;
                }

                return skin;
            }
        }

        private Dictionary<string, TalentPath> pathLookup;

        public TalentPath GetPath(string pathName)
        {
            if (String.IsNullOrEmpty(pathName))
            {
                return null;
            }


            if (pathLookup == null)
            {
                pathLookup = availablePaths.ToDictionary(p => p.name);
            }
            return pathLookup.TryGetValue(pathName, out var path) ? path : null;
        }

        public bool ArePathsExclusive(string pathAName, string pathBName)
        {
            var pathA = GetPath(pathAName);
            var pathB = GetPath(pathBName);
            if (pathA == null || pathB == null) return false;
            return pathA.IsPathExclusiveWith(pathB);
        }

        public List<TalentTreeNodeDef> GetAllNodes()
        {
            if (nodes.NullOrEmpty())
                return new List<TalentTreeNodeDef>();

            var allNodes = new HashSet<TalentTreeNodeDef>();
            var toProcess = new Queue<TalentTreeNodeDef>();
            toProcess.Enqueue(nodes[0]);

            while (toProcess.Count > 0)
            {
                var node = toProcess.Dequeue();
                if (allNodes.Add(node))
                {
                    if (!node.connections.NullOrEmpty())
                    {
                        foreach (var connected in node.connections)
                        {
                            toProcess.Enqueue(connected);
                        }
                    }

                    if (node.IsBranchNode && !node.branchPaths.NullOrEmpty())
                    {
                        foreach (var branch in node.branchPaths)
                        {
                            foreach (var branchNode in branch.nodes)
                            {
                                toProcess.Enqueue(branchNode);
                            }
                        }
                    }
                }
            }
            return allNodes.ToList();
        }


    }
}
