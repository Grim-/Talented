using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentTreeSkinDef : Def
    {
        // Background configuration
        public string backgroundTexturePath;
        public ScaleMode backgroundScaleMode = ScaleMode.ScaleAndCrop;
        private string defaultbackgroundTexturePath = "UI/Tree/defaultbackground";
        public Color? backgroundColor;



        public Color TreeListColor = Color.clear;
        public Color TreeListOutlineColor = Color.grey;

        //Tree list appearance
        public string treeListbackgroundTexturePath;
        public ScaleMode treeListbackgroundScaleMode = ScaleMode.ScaleAndCrop;
        public bool HasCustomTreeListBG => !string.IsNullOrEmpty(treeListbackgroundTexturePath);


        // Node appearance
        public string nodeTexturePath = "UI/Tree/defaultnode";
        private string defaultNodeTexturePath = "UI/Tree/defaultnode";

        private string defaultUpgradeNodeTexturePath = "UI/Tree/defaultupgradeicon";

        public float nodeSize = 60f;
        public float nodeSpacing = 10f;

        // Connection appearance
        public string connectionTexturePath = "UI/Tree/defaultconnection";
        private string defaultConnectionTexturePath = "UI/Tree/defaultconnection";
        public float connectionThickness = 1.5f;
        public bool showConnectionArrows = true;
        public float arrowSize = 10f;
        public float connectionLinkSize = 20f;

        public float windowMargin = 0f;

        // Color scheme
        public Color unlockedNodeColor = new Color(0.2f, 0.8f, 0.2f);
        public Color availableNodeColor = Color.grey;
        public Color lockedNodeColor = Color.red;
        public Color pathSelectedColor = Color.yellow;
        public Color pathExcludedColor = Color.red;
        public Color pathAvailableColor = Color.white;

        // Connection colors
        public Color unlockedConnectionColor = new Color(0.2f, 0.8f, 0.2f, 0.8f);
        public Color activeConnectionColor = new Color(0.8f, 0.8f, 0.2f, 0.6f);
        public Color inactiveConnectionColor = new Color(0.5f, 0.5f, 0.5f, 0.3f);

        // Text configuration
        public float labelOffset = 5f;
        public float pathLabelOffset = 25f;
        public GameFont labelFont = GameFont.Small;
        public Color labelColor = Color.white;

        public static Texture2D LoadTexture(string customPath, string defaultPath, string textureType)
        {
            if (!customPath.NullOrEmpty())
            {
                Texture2D customTexture = ContentFinder<Texture2D>.Get(customPath, false);
                if (customTexture != null)
                {
                    return customTexture;
                }
                Log.Message($"Failed to load custom {textureType} texture at path: {customPath}. Falling back to default.");
            }

            // Load default texture
            Texture2D defaultTexture = ContentFinder<Texture2D>.Get(defaultPath, false);
            if (defaultTexture == null)
            {
                Log.Message($"Failed to load default {textureType} texture at path: {defaultPath}");
            }
            return defaultTexture;
        }


        private Texture2D cachedtreeListBackgroundTexture;
        public Texture2D TreeListBackgroundTexture
        {
            get
            {
                if (cachedtreeListBackgroundTexture == null && HasCustomTreeListBG)
                {
                    cachedtreeListBackgroundTexture = ContentFinder<Texture2D>.Get(treeListbackgroundTexturePath, false);
                }
                return cachedtreeListBackgroundTexture;
            }
        }

        private Texture2D cachedBackgroundTexture;
        public Texture2D BackgroundTexture
        {
            get
            {
                if (cachedBackgroundTexture == null)
                {
                    cachedBackgroundTexture = LoadTexture(backgroundTexturePath, defaultbackgroundTexturePath, "background");
                }
                return cachedBackgroundTexture;
            }
        }
        private Texture2D cachedNodeTexture;
        public Texture2D NodeTexture
        {
            get
            {
                if (cachedNodeTexture == null)
                {
                    cachedNodeTexture = LoadTexture(nodeTexturePath, defaultNodeTexturePath, "node");
                }
                return cachedNodeTexture;
            }
        }


        private Texture2D cachedDefaultUpgradeIcon;
        public Texture2D DefaultUpgradeIcon
        {
            get
            {
                if (cachedDefaultUpgradeIcon == null)
                {
                    cachedDefaultUpgradeIcon = LoadTexture(defaultUpgradeNodeTexturePath, defaultUpgradeNodeTexturePath, "node");
                }
                return cachedDefaultUpgradeIcon;
            }
        }


        private Texture2D cachedConnectionTexture;
        public Texture2D ConnectionTexture
        {
            get
            {
                if (cachedConnectionTexture == null)
                {
                    cachedConnectionTexture = LoadTexture(connectionTexturePath, defaultConnectionTexturePath, "connection");
                }
                return cachedConnectionTexture;
            }
        }
        public bool HasConnectionTexure => !string.IsNullOrEmpty(defaultConnectionTexturePath);
    }
}
