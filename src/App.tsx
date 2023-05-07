import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// SPEC: 各APIデータの型
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
        // TODO: APIキーをenvファイルに格納してセキュリティ対策をする
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
    // TODO: 複数の都道府県が正しく表示されるように修正する
    axios
      .get(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCodes}&yearFrom=1980&yearTo=2020`,
        {
          // TODO: APIキーをenvファイルに格納してセキュリティ対策をする
          headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
        }
      )
      .then((res) => {
        if (populationData.length === 0) {
          return <div>Loading...</div>;
        }
        setPopulationData(res.data.result)
        console.log(res.data.result);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedPrefectures]);

  // チェックボタンの操作
  const handleCheckbox = (prefCode: number) => {
    //       チェックが外された都道府県のcodeをselectedPrefecturesから外す
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
  const chartOptions: Highcharts.Options = {
    title: {
      text: "各都道府県の人口増減率",
    },
    xAxis: {
      categories: Array.from({ length: 41 }, (_, i) => (1980 + i).toString())
    },
    yAxis: {
      title: {
        text: "人口構成比（%）",
      },
    },
    series: populationData.map((data) => ({
      name: data.label,
      data: data.data,
      type: "line"
    })),
  };
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
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </>
  );
}