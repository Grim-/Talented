using System.Collections.Generic;
using UnityEngine;

namespace Talented
{
    public interface ITreeDisplayStrategy
    {
        Dictionary<TalentTreeNodeDef, Rect> PositionNodes(List<TalentTreeNodeDef> nodes, Rect availableSpace, float nodeSize, float spacing);
        void DrawToolBar(Rect toolbarRect);
    }
}
