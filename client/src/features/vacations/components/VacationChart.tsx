import React from "react";
import { Bar } from "react-chartjs-2";
import { useGetFollowStatsQuery } from "../../../app/services/tripsApi";

const _rn = () => Math.floor(Math.random() * 256);

export default function VacationChart() {
  const { data: vacationFollowStats } = useGetFollowStatsQuery();
  const vacationTitles = vacationFollowStats?.map(({ title }) => title);
  const vacationFollows = vacationFollowStats?.map(({ follows }) => follows);
  console.log(`vacationFollows`, vacationFollows);
  const backgroundColors = vacationFollowStats?.map(
    (e) => `rgba(${_rn()},${_rn()},${_rn()},0.2)`
  );
  const borderColors = backgroundColors?.map((rgba) => {
    const split = rgba.split(",");
    split[split.length - 1] = "1)";
    return split.join();
  });

  const data = {
    labels: vacationTitles,
    datasets: [
      {
        label: "# of Followers",
        data: vacationFollows,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };
  return <Bar data={data} options={options as any} height={100} />;
}
