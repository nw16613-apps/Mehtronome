import copy
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("audition",Path(__file__).with_name("audition.py"))
audition=importlib.util.module_from_spec(spec); spec.loader.exec_module(audition)


class MidiInputs(unittest.TestCase):
    def fixture(self):
        return {"version":1,"generated":False,"style":"blues","bpm":112,"totalBeats":64,"primerBeats":16,"beatsPerBar":4,
                "programs":{"controls":0,"bass":33,"comping":27,"sequence":16},
                "chords":[{"beat":0,"duration":64,"chordPcs":[5,9,0,3,7]}],
                "tracks":{"bass":[{"beat":0,"duration":1,"notes":[41],"velocity":.5},
                                  {"beat":16,"duration":1,"notes":[43],"velocity":.5}],
                          "comping":[{"beat":15.5,"duration":3,"notes":[60,64,67],"velocity":.5}],
                          "sequence":[{"beat":2/3,"duration":.3,"notes":[72],"velocity":.5}]}}

    def test_round_trip_tempo_primer_and_roles(self):
        f=audition.validate(self.fixture())
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/"notes.mid"; audition.write_midi(f,p,primer=True)
            events=audition.read_events(p,112,16,f["programs"])
            self.assertTrue(all(e["beat"]<16 and e["beat"]+e["duration"]<=16.001 for e in events))
            self.assertEqual({e["role"] for e in events},{"bass","comping","sequence"})
            self.assertTrue(all(e["origin"]=="primer" for e in events))
            self.assertAlmostEqual(next(e for e in events if e["midi"]==72)["beat"],2/3,places=5)
            audition.write_midi(f,p)
            self.assertEqual(sum(e["origin"]=="model" for e in audition.read_events(p,112,16,f["programs"])),1)

    def test_controls_keep_extensions_off_the_audible_tracks(self):
        f=self.fixture()
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/"controls.mid"; audition.write_midi(f,p,controls=True)
            events=audition.read_events(p,112,16,f["programs"])
            self.assertEqual({e["program"] for e in events},{0})
            self.assertEqual({e["midi"]%12 for e in events},{0,3,5,7,9})
            self.assertTrue(all(e["role"]=="unmapped" for e in events))

    def test_rejects_fake_generation_and_invalid_timing(self):
        for mutate in [lambda f:f.update(generated=True),lambda f:f.update(bpm=0),
                       lambda f:f["tracks"]["bass"][0].update(beat=float("nan"))]:
            f=copy.deepcopy(self.fixture());mutate(f)
            with self.assertRaises(ValueError):audition.validate(f)


if __name__=="__main__":unittest.main()
