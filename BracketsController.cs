using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using NflnInteractive.Lookup.Entities;
using RCS.WEB.NFLN.Models;

namespace RCS.WEB.NFLN.Controllers
{
    public class BracketsController : Controller
    {
        public List<ShowsAndSponsors> Shows { get; set; }

        //
        // GET: /Brackets/
        public ActionResult AddSegment()
        {
            return View();
        }

        public ActionResult EditSegment()
        {
            var tables = new List<SegmentTables>();

            try
            {
                using (var sql = new NFLIntDevEntities())
                {
                    int id = sql.UserProfiles.Single(i => i.UserName.Equals(User.Identity.Name)).UserId;

                    var segments = sql.Segments.Where(i => i.UID == id && i.Type == (decimal)SegmentType.Brackets);

                    foreach (var segment in segments)
                    {
                        tables.Add(new SegmentTables
                        {
                            ID = segment.ID,
                            SegmentName = segment.Name,
                            SegmentType = "Brackets",
                        });
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return View(tables);
        }

        public ActionResult ManageSegment(int id)
        {
            ViewBag.SegId = id;
            return View();
        }

        [HttpPost]
        public string AddSegment(string bracketsJson)
        {
            // Edit
            Shows = LookUp.GetShows();

            try
            {
                var bracketsData = JsonConvert.DeserializeObject<BracketsModel>(bracketsJson);

                using (var sql = new NFLIntDevEntities())
                {
                    int id = sql.UserProfiles.Single(i => i.UserName.Equals(User.Identity.Name)).UserId;

                    var segment = new Segment
                    {
                        UID = id,
                        LogoLeft = "",
                        LogoRight = "",
                        Name = bracketsData.SegmentName,
                        Subtitle = "",
                        Title = "",
                        Type = (int)SegmentType.Brackets
                    };

                    sql.Segments.Add(segment);
                    sql.SaveChanges();

                    id = segment.ID;

                    bracketsData.Logo = GetLogoPath(bracketsData.Logo);

                    var brackets = new Bracket
                    {
                        SID = id,
                        Brackets = JsonConvert.SerializeObject(bracketsData)
                    };

                    sql.Brackets.Add(brackets);
                    sql.SaveChanges();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Url.Action("EditSegment");
        }

        [HttpPost]
        public string ManageSegment(string bracketsJson, int segId)
        {
            Shows = LookUp.GetShows();

            try
            {
                var bracketsData = JsonConvert.DeserializeObject<BracketsModel>(bracketsJson);

                using (var sql = new NFLIntDevEntities())
                {
                    var segment = sql.Segments.Single(i => i.ID == segId);

                    segment.Name = bracketsData.SegmentName;
                    sql.SaveChanges();

                    bracketsData.Logo = GetLogoPath(bracketsData.Logo);

                    var brackets = sql.Brackets.Single(i => i.SID == segId);
                    brackets.Brackets = JsonConvert.SerializeObject(bracketsData);
                    sql.SaveChanges();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return Url.Action("EditSegment");
        }

        #region AJAX Requests

        [HttpGet]
        public string GetLogos()
        {
            var shows = new List<ShowsAndSponsors>();

            try
            {
                using (var sql = new NFLLookupEntities())
                {
                    var nflShows = sql.nflnShows;
                    shows.AddRange(nflShows.Select(show => new ShowsAndSponsors
                    {
                        Key = show.userKey,
                        Path = show.logoPath
                    }));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return JsonConvert.SerializeObject(shows);
        }

        [HttpGet]
        public string GetAFCTeams()
        {
            var nfl = new List<NFL>();

            try
            {
                using (var sql = new NFLLookupEntities())
                {
                    var teams = sql.nflTeams.Where(c => c.conference.Equals("AFC"));
                    teams = teams.OrderBy(d => d.displayName);
                    nfl.AddRange(teams.Select(team => new NFL
                    {
                        Tricode = team.tricode,
                        FullName = team.fullName,
                        DisplayName = team.displayName,
                        Path = team.logoPath,
                        Conference = "AFC",
                    }));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return JsonConvert.SerializeObject(nfl);
        }

        [HttpGet]
        public string GetNFCTeams()
        {
            var nfl = new List<NFL>();

            try
            {
                using (var sql = new NFLLookupEntities())
                {
                    var teams = sql.nflTeams.Where(c => c.conference.Equals("NFC"));
                    teams = teams.OrderBy(d => d.displayName);
                    nfl.AddRange(teams.Select(team => new NFL
                    {
                        Tricode = team.tricode,
                        FullName = team.fullName,
                        DisplayName = team.displayName,
                        Path = team.logoPath,
                        Conference = "NFC",
                    }));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return JsonConvert.SerializeObject(nfl);
        }

        public string GetBrackets(int id)
        {
            Shows = LookUp.GetShows();

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
                        brackets.Logo = GetLogoName(brackets.Logo);

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

            return JsonConvert.SerializeObject(brackets);
        }

        #endregion

        [HttpGet]
        public ActionResult Delete(int id)
        {
            try
            {
                using (var sql = new NFLIntDevEntities())
                {
                    var segRow = sql.Segments.Single(i => i.ID == id);
                    sql.Segments.Remove(segRow);
                    sql.SaveChanges();
                    var prRow = sql.Brackets.Single(i => i.SID == id);
                    sql.Brackets.Remove(prRow);
                    sql.SaveChanges();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return RedirectToAction("EditSegment", "Brackets");
        }

        private string GetLogoPath(string image)
        {
            string path = "";
            try
            {
                return Shows.FirstOrDefault(s => s.Key.Equals(image)).Path;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return path;
        }

        private string GetLogoName(string image)
        {
            string path = "";
            try
            {
                return Shows.FirstOrDefault(s => s.Path.Equals(image)).Key;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return path;
        }
    }
}
