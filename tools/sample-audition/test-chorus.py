import importlib.util,pathlib,unittest
import numpy as np
spec=importlib.util.spec_from_file_location('chorus',pathlib.Path(__file__).with_name('chorus.py'));chorus=importlib.util.module_from_spec(spec);spec.loader.exec_module(chorus)
class ChorusAudioTests(unittest.TestCase):
 def test_silence_and_bypass(self):
  self.assertEqual(float(abs(chorus.process(np.zeros(32000))).max()),0)
  x=np.random.default_rng(1).normal(0,.01,32000);out=chorus.process(x,wet=0)
  np.testing.assert_allclose(out[:,0],x,atol=1e-8);np.testing.assert_array_equal(out[:,0],out[:,1])
 def test_dry_attack_is_not_delayed_and_no_feedback_echo(self):
  x=np.zeros(32000);x[100]=.5;out=chorus.process(x)
  self.assertGreater(float(out[100,0]),.4);self.assertEqual(int(np.argmax(abs(out[:,0]))),100)
  self.assertLess(float(abs(out[4000:]).max()),1e-7)
 def test_subtle_stereo_motion_retains_mono_body(self):
  rate=32000;t=np.arange(rate*4)/rate;x=np.sin(2*np.pi*220*t)*.1;out=chorus.process(x)
  side=(out[:,0]-out[:,1])/2;mid=out.mean(axis=1)
  self.assertGreater(float(np.sqrt(np.mean(side**2))),.0005)
  self.assertLess(float(np.sqrt(np.mean(side**2))),float(np.sqrt(np.mean(mid**2)))*.25)
  self.assertGreater(float(np.sqrt(np.mean(mid**2))),float(np.sqrt(np.mean(x**2)))*.6)
if __name__=='__main__':unittest.main()
