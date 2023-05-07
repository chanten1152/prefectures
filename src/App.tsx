import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./App.scss";

// SPEC: 各APIデータの型
type PrefecturesData = {
  prefCode: number;
  prefName: string;
};

type PopulationData = {
  year: number;
  value: string;
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
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 人口構成データの取得
  useEffect(() => {
    // TODO: 複数の都道府県が正しく表示されるように修正する
    const addAreas = selectedPrefectures.join("_,");
    axios
      .get(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&addArea=${addAreas}`,
        {
          // TODO: APIキーをenvファイルに格納してセキュリティ対策をする
          headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
        }
      )
      .then((res) => {
        setPopulationData(res.data.result.data[0].data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedPrefectures]);

  // チェックボタンの操作
  const handleCheckbox = (prefCode: number) => {
    // SPEC: チェックされた都道府県のcodeをselectedPrefecturesに入れる
    //       チェックが外された都道府県のcodeをselectedPrefecturesから外す
    const isChecked = selectedPrefectures.includes(prefCode);
    if (isChecked) {
      setSelectedPrefectures((prevState) =>
        prevState.filter((code) => code !== prefCode)
      );
    } else {
      setSelectedPrefectures((prevState) => [...prevState, prefCode]);
    }
  };
  const chartOptions: Highcharts.Options = {
    title: {
      text: "各都道府県の人口増減率",
    },
    yAxis: {
      title: {
        text: "人口構成比（%）",
      },
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointInterval: 5,
        pointStart: 1960,
      },
    },
    series: [
      //TODO: 47都道府県分mapでループ処理する.populationDataを使用する。
      {
        name: "北海道",
        data: [
          5039206, 5171800, 5184287, 5338206, 5575989, 5679439, 5643647,
          5692321, 5683062, 5627737, 5506419, 5381733, 5224614, 5016554,
          4791592, 4546357, 4280427, 4004973,
        ],
        type: "line",
      },
    ],
  };
  return (
    <>
      <header className="header">
        <h1 className="header__title">都道府県別の総人口推移グラフ</h1>
      </header>
      <div className="wrapper">
        <h2>都道府県</h2>
        <div className="prefecture__container">
          {prefectures.map((prefecture) => (
            <div key={prefecture.prefCode} className="prefecture__item">
              <input
                className="prefecture__input"
                type="checkbox"
                id={`checkbox-${prefecture.prefCode}`}
                name={prefecture.prefName}
                onChange={() => handleCheckbox(prefecture.prefCode)}
              />
              <label className="prefecture__label">{prefecture.prefName}</label>
            </div>
          ))}
        </div>
        <h2>人口数</h2>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </>
  );
}
