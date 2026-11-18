import importlib.util,struct,tempfile,unittest,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('midi_trial',root/'scripts/prepare-drum-midi-trial.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class MidiTrialTests(unittest.TestCase):
 def parse(self,track):
  data=b'MThd'+struct.pack('>IHHH',6,0,1,480)+b'MTrk'+struct.pack('>I',len(track))+track
  with tempfile.NamedTemporaryFile() as f:f.write(data);f.flush();return module.read_midi(f.name)
 def test_running_status_preserves_unquantized_onsets_and_velocities(self):
  result=self.parse(bytes([0,255,81,3,9,137,104,5,153,38,93,7,38,24,0,38,0,0,255,47,0]))
  self.assertEqual(result['tempos'],[[0,625000]])
  self.assertEqual([(n['beat'],n['velocity']) for n in result['notes']],[(5/480,93),(12/480,24)])
 def test_sysex_length_and_pedal_control_do_not_shift_following_notes(self):
  result=self.parse(bytes([0,240,2,1,247,0,185,4,100,3,153,42,71,0,255,47,0]))
  self.assertEqual(result['hiHatPedal'],[{'beat':0,'value':100}]);self.assertEqual(result['notes'][0]['beat'],3/480)
 def test_bundled_originals_match_provenance_and_retained_performance_events(self):
  data=json.loads((root/'public/drum-midi-trial/performances.json').read_text())
  for p in data['performances']:
   for s in p['sources']:
    file=root/'public/drum-midi-trial'/s['file'];self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),s['sha256'])
    parsed=module.read_midi(file);self.assertEqual(parsed['notes'],s['notes']);self.assertEqual(parsed['hiHatPedal'],s['hiHatPedal'])
    self.assertTrue(all(n['channel']==9 for n in s['notes']));self.assertEqual(s['metres'][0],[0,4,4])
    self.assertTrue(any(abs(n['beat']*4-round(n['beat']*4))>.02 for n in s['notes']))
if __name__=='__main__':unittest.main()
