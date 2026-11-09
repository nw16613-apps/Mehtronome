import importlib.util,pathlib,unittest
import numpy as np
spec=importlib.util.spec_from_file_location('amp',pathlib.Path(__file__).with_name('amp.py'));amp=importlib.util.module_from_spec(spec);spec.loader.exec_module(amp)
class AmpAudioTests(unittest.TestCase):
 def test_silence_is_silent_and_no_nonfinite_output(self):
  for p in amp.PROFILES:
   out=amp.process(np.zeros(32000),p,np.array([1.,0.,0.]));self.assertEqual(float(max(abs(out))),0)
 def test_drive_changes_actual_waveform_and_retains_played_pitch(self):
  rate=32000;t=np.arange(rate)/rate;signal=np.sin(2*np.pi*220*t)*.02
  clean=amp.process(signal,'clean',np.array([1.]));blues=amp.process(signal,'blues',np.array([1.]));self.assertTrue(np.isfinite(blues).all())
  def harmonic(x,f):return abs(np.sum(x[3200:]*np.exp(-2j*np.pi*f*t[3200:])))
  self.assertGreater(harmonic(blues,660)/harmonic(blues,220),harmonic(clean,660)/harmonic(clean,220)*2)
  self.assertGreater(harmonic(blues,220),harmonic(blues,440)*5)
 def test_cabinet_changes_spectrum_and_preserves_duration(self):
  rng=np.random.default_rng(123);signal=rng.standard_normal(32000)*.002
  raw=amp.process(signal,'clean',np.array([1.]));cab=amp.process(signal,'clean',np.ones(32)/32)
  self.assertEqual(len(raw),len(cab));f=np.fft.rfftfreq(len(raw),1/32000)
  self.assertLess(np.sum(abs(np.fft.rfft(cab))[f>4000]**2),np.sum(abs(np.fft.rfft(raw))[f>4000]**2)*.05)
 def test_input_accents_survive_saturation(self):
  t=np.arange(32000)/32000;s=np.sin(2*np.pi*220*t)
  soft=amp.process(s*.003,'blues',np.array([1.]));firm=amp.process(s*.012,'blues',np.array([1.]))
  self.assertGreater(np.sqrt(np.mean(firm**2)),np.sqrt(np.mean(soft**2))*1.5)
if __name__=='__main__':unittest.main()
