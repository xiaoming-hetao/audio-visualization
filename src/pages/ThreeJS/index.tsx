import React, { useEffect, useRef, useState } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import styles from "../Canvas/index.module.css";

enum AudioStatus {
  play = "PLAY",
  pause = "PAUSE",
}

const ThreeJS = () => {
  const audioElement = useRef({} as HTMLMediaElement);
  const [isConnect, setIsConnect] = useState(false);
  const [isPlay, setIsPLay] = useState(false);

  const barsNum: number = 60; // 柱状条的数量
  let bars: Mesh[] = [];

  // 获取随机颜色
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF".split("");
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // 创建柱状条
  const createBars = (scene: Scene) => {
    for (let i = 0; i < barsNum; i++) {
      const barGeometry = new BoxGeometry(0.5, 0.5, 0.5);

      // 材质
      const material = new MeshPhongMaterial({
        color: getRandomColor(),
        specular: 0xffffff,
      });

      // 创建几何体框架并放置在特定位置上
      bars[i] = new Mesh(barGeometry, material);
      bars[i].position.set(i - barsNum / 2, 0, -10);

      // 将几何体放到场景中
      scene.add(bars[i]);
    }
  };

  const createScene = () => {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight - 200;

    // 创建three.js场景
    const scene = new Scene();
    // 创建好的几何体
    createBars(scene);

    // 创建相机
    const camera = new PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 20000);
    camera.position.set(0, 0, 45);
    scene.add(camera);

    // 创建渲染器
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor("#007a99", 1); // 背景颜色
    document.getElementById("renderer")?.appendChild(renderer.domElement);

    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();

    // 更新渲染器大小，方向以及投影矩阵
    window.addEventListener("resize", () => {
      const dynamicWIDTH = window.innerWidth;
      const dynamicHEIGHT = window.innerHeight - 200;
      console.log("123");
      renderer.setSize(dynamicWIDTH, dynamicHEIGHT);
      camera.aspect = dynamicWIDTH / dynamicHEIGHT;
      camera.updateProjectionMatrix();
    });

    // 创建光源
    const light = new PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    scene.add(light);

    // 让场景放大缩小旋转
    const controls = new OrbitControls(camera, renderer.domElement);

    return {
      scene,
      camera,
      renderer,
      controls,
    };
  };

  // 删除容纳渲染器的dom
  const deleteRendererDom = () => {
    const delDom = document.getElementById("renderer");
    const delDomParent = delDom?.parentElement;
    delDomParent?.removeChild(delDom as Node);
  };

  //  为渲染器创建dom
  const createRendererDom = () => {
    const containerElement = document.getElementById("container");
    const rendererElement = document.createElement("div");
    rendererElement.id = "renderer";
    containerElement?.insertBefore(rendererElement, audioElement.current);
  };

  const onLoadAudio = () => {
    createRendererDom();

    const { scene, camera, renderer, controls } = createScene();

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

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      // 获取频率数据
      // getByteFrequencyData 是对已有的数组元素进行赋值，而不是创建后返回新的数组。
      analyser.getByteFrequencyData(dataArray);

      // 开始渲染
      renderer.render(scene, camera);
      controls.update();

      const step = Math.round(dataArray.length / barsNum);

      // 循环改变创建的几何体在y轴上的缩放
      for (let i = 0; i < barsNum; i++) {
        let value = dataArray[i * step] / 4;
        value = value < 1 ? 1 : value;
        bars[i].scale.y = value;
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
      deleteRendererDom();
      onLoadAudio();
    }
  };

  useEffect(() => {
    const { scene, camera, renderer } = createScene();
    // 初始渲染
    renderer.render(scene, camera);
  }, []);

  return (
    <div id="container" className={styles.container}>
      <div id="renderer"></div>
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

export default ThreeJS;
