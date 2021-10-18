import React, { useRef, useState } from "react";
import styles from "./index.module.css";

enum AudioStatus {
  play = "PLAY",
  pause = "PAUSE",
}
const Canvas = () => {
  const canvasElement = useRef({} as HTMLCanvasElement);
  const audioElement = useRef({} as HTMLMediaElement);
  const [isConnect, setIsConnect] = useState(false);
  const [isPlay, setIsPLay] = useState(false);

  const onLoadAudio = () => {
    // 创建音频上下文
    const context = new window.AudioContext();
    // 创建分析器，用于获取音频的频率数据
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;

    // 设置音频节点，关联到 AudioContext 上，作为整个音频分析过程的输入
    const source = context.createMediaElementSource(audioElement.current); //通过<audio>节点创建音频源

    source.connect(analyser); //将音频源关联到分析器
    analyser.connect(context.destination); //把分析器关联到输出设备
    setIsConnect(true);

    const canvas = canvasElement.current;
    canvas.width = window.innerWidth;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = (WIDTH / bufferLength) * 1.5;
    let barHeight;

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      // 获取频率数据
      // getByteFrequencyData 是对已有的数组元素进行赋值，而不是创建后返回新的数组。
      analyser.getByteFrequencyData(dataArray);

      ctx!.clearRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0, x = 0; i < bufferLength; i++) {
        // 根据频率值映射一个矩形的高度
        barHeight = dataArray[i];

        // 根据每个矩形的高度映射一个背景色，使用渐变效果
        const gradient = ctx!.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, "#0f00f0");
        gradient.addColorStop(0.5, "#ff0ff0");
        gradient.addColorStop(0, "#f00f00");
        ctx!.fillStyle = gradient; //填充

        ctx!.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }
    }

    renderFrame();
  };

  const handleClick = () => {
    if (!isPlay) {
      audioElement.current.play();
    } else {
      audioElement.current.pause();
    }
    setIsPLay(!isPlay);

    if (!isConnect) {
      onLoadAudio();
    }
  };

  return (
    <div className={styles.container}>
      <canvas ref={canvasElement} className={styles.canvas}></canvas>
      <audio
        ref={audioElement}
        src="//m8.music.126.net/21180815163607/04976f67866d4b4d11575ab418904467/ymusic/515a/5508/520b/f0cf47930abbbb0562c9ea61707c4c0b.mp3?infoId=92001"
        crossOrigin="anonymous"
      ></audio>
      <div className={styles.controlButton} onClick={handleClick}>
        {isPlay ? AudioStatus.pause : AudioStatus.play}
      </div>
    </div>
  );
};

export default Canvas;
