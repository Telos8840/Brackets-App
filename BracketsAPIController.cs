using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using NflnInteractive.Lookup.Entities;
using RCS.WEB.NFLN.Models;

namespace RCS.WEB.NFLN.API
{
    public class BracketsAPIController : ApiController
    {
        public List<ShowsAndSponsors> Shows { get; set; }

        public BracketsModel Get(int id)
        {
            var brackets = new BracketsModel();

            try
            {
                using (var sql = new NFLIntDevEntities())
                {
                    var bracket = sql.Brackets.FirstOrDefault(i => i.SID == id);
                    if (bracket != null)
                    {
                        var jsonData = bracket.Brackets;
                        brackets = JsonConvert.DeserializeObject<BracketsModel>(jsonData);

                        for (int i = 0; i < brackets.AfcTeams.Count; i++)
                            if (brackets.AfcTeams[i] == null)
                                brackets.AfcTeams[i] = new BracketTeam();

                        for (int i = 0; i < brackets.NfcTeams.Count; i++)
                            if (brackets.NfcTeams[i] == null)
                                brackets.NfcTeams[i] = new BracketTeam();
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return brackets;
        }
    }
}