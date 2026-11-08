"""Public checkpoint download only. Does not send charts or contact a paid API."""
import argparse
import json
import shutil
from pathlib import Path

from huggingface_hub import HfApi,snapshot_download

MODEL="stanford-crfm/music-medium-800k"


def main():
    parser=argparse.ArgumentParser();parser.add_argument("output");args=parser.parse_args()
    destination=Path(args.output);destination.mkdir(parents=True,exist_ok=True)
    info=HfApi().model_info(MODEL,files_metadata=True,token=False)
    files={item.rfilename:item for item in info.siblings}
    weights=next((name for name in ["model.safetensors","pytorch_model.bin"] if name in files),None)
    if not weights or "config.json" not in files:
        raise RuntimeError("Unexpected checkpoint layout; inspect before downloading")
    size=files[weights].size
    if not size or size>2*1024**3:
        raise RuntimeError("Unexpected model size; no weights downloaded")
    if shutil.disk_usage(destination).free<size+512*1024**2:
        raise RuntimeError("Not enough space for the model and temporary download")
    snapshot_download(MODEL,revision=info.sha,local_dir=destination,token=False,
                      allow_patterns=["config.json","generation_config.json",weights])
    if (destination/weights).stat().st_size!=size:
        raise RuntimeError("Checkpoint file size does not match pinned model metadata")
    receipt={"status":"downloaded","model":MODEL,"revision":info.sha,"weights":weights,"bytes":size}
    (destination/"audition-model.json").write_text(json.dumps(receipt,indent=2)+"\n")
    print(json.dumps(receipt))


if __name__=="__main__":main()
