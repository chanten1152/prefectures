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
  let resultPrefecture = []

  // 47都道府県を配列に格納
  const allPrefectures = []
  prefectures.map((prefecture) => {
    allPrefectures.push(prefecture.prefName)
  })
  const newAllPrefectures = allPrefectures.filter((el, index) => allPrefectures.indexOf(el) === index)

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
    const addAreas = selectedPrefectures.join(",");
    for (let i = 0; i < selectedPrefectures.length; i++) {
      axios
        .get(
          `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${selectedPrefectures[i]}`,
          {
            // TODO: APIキーをenvファイルに格納してセキュリティ対策をする
            headers: { "X-API-KEY": "MeaGAz2tHIvBqKuGIDyvhXzTRteXOoXljZTOpz6V" },
          }
        )
        .then((res) => {
          // console.log(populationData, "first")
          setPopulationData(res.data.result.data[0].data);
          console.log(i, 'iの回数')
          console.log(selectedPrefectures[i], 'selectoのiの回数')
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          resultPrefecture.push(populationData)
        })
      }
    }, [selectedPrefectures]);
    
    resultPrefecture.push(populationData)
  console.log(selectedPrefectures, 'selectessssssd')
  console.log(resultPrefecture, 'resultの結果〜')


  // チェックボタンの操作
  const handleCheckbox = (prefCode: number) => {
    // SPEC: チェックされた都道府県のcodeをselectedPrefecturesに入れる
    //       チェックが外された都道府県のcodeをselectedPrefecturesから外す
    const isChecked = !selectedPrefectures.includes(prefCode);
    if (isChecked) {
      setSelectedPrefectures((prevState) => [...prevState, prefCode]);
    } else {
      setSelectedPrefectures((prevState) =>
        prevState.filter((code) => code !== prefCode)
      );
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
        name: `${newAllPrefectures[selectedPrefectures[0]-1]}`,
        data: populationData.map(item => item.value),
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
              {prefecture.prefCode}
            </div>
          ))}
        </div>
        <h2>人口数</h2>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </>
  );
}
