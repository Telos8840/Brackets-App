using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RCS.WEB.NFLN.Models
{
    public class BracketsModel
    {
        public string SegmentName { get; set; }
        public bool IsAfcOnLeft { get; set; }
        public string Logo { get; set; }
        public List<BracketTeam> AfcTeams { get; set; }
        public List<BracketTeam> NfcTeams { get; set; }
        public List<string> Labels { get; set; }
    }

    public class BracketTeam
    {
        public string Tri { get; set; }
        public string Name { get; set; }
        public string Rank { get; set; }
    }
}