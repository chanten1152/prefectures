import React, { useState, ReactNode, useEffect } from "react";
import "./App.css";
import axios, { AxiosResponse } from "axios";
// import ReactDOM from "react-dom/client";
// import CheckField from "./CheckField";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// apiデータの型を決める
type PrefecturesData = {
  prefCode: number;
  prefName: string;
};

type PopulationData = {
  label: string;
  data: number[];
};

type PopulationResponse = {
  message: string;
  result: {
    label: string;
    data: number[];
  }[];
};

export default function App() {
  // ステートの定義
  const [prefectures, setPrefectures] = useState<PrefecturesData[]>([]);
  const [populationData, setPopulationData] = useState<PopulationData[]>([]);
  const [selectedPrefectures, setSelectedPrefectures] = useState<number[]>([]);

  // 都道府県一覧を取得
  useEffect(() => {
    axios
      .get("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
        headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
      })
      .then((res) => {
        setPrefectures(res.data.result);
        console.log(res.data.result);
        // console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 人口構成データの取得
  useEffect(() => {
    const prefCodes = selectedPrefectures.join(",");
    axios
      .get(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=11362&prefCode=11,12`,
        {
          headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
        }
      )
      .then((res) => {
        setPopulationData(res.data.result)
        console.log(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedPrefectures]);
  // 動作確認用のクリックボタン処理
  const onClickFetchData = () => {
    axios
      .get("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
        headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
      })
      .then((res) => {
        setPrefectures(res.data.result);
        console.log(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // チェックボタンを押したら作動
  const handleCheckbox = (prefCode: number) => {
    const isChecked = selectedPrefectures.includes(prefCode);
    if (isChecked) {
      console.log("こっちが呼ばれた！");
      setSelectedPrefectures((prevState) =>
        prevState.filter((code) => code !== prefCode)
      );
    } else {
      console.log("最後が呼ばれた！");
      setSelectedPrefectures((prevState) => [...prevState, prefCode]);
    }
    // console.log(`Checkbox ${prefCode} changed!`);
  };
  // const options = {
  //   title: {
  //     text: "各都道府県の人口増減率",
  //   },
  //   xAxis: {
  //     categories: Array.from({ length: 41 }, (_, i) => 1980 + i),
  //   },
  //   yAxis: {
  //     title: {
  //       text: "人口構成比（%）",
  //     },
  //   },
  //   series: populationData.map((data) => ({
  //     name: data.label,
  //     data: data.data,
  //   })),
  // };
  return (
    <>
      <h1>都道府県</h1>
      <button onClick={onClickFetchData}>データ取得</button>
      {prefectures.map((prefecture) => (
        <div key={prefecture.prefCode}>
          <input
            type="checkbox"
            id={`checkbox-${prefecture.prefCode}`}
            name={prefecture.prefName}
            value={prefecture.prefCode}
            onChange={() => handleCheckbox(prefecture.prefCode)}
          />
          <label htmlFor={`checkbox-${prefecture.prefCode}`}>
            {prefecture.prefName}
          </label>
        </div>
      ))}
      <h2>人口数</h2>
      <HighchartsReact highcharts={Highcharts} />
    </>
  );
}