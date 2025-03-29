import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TournamentBracket from "../../components/TournamentBracket/TournamentBracket";
import Ad from "../../components/Ad/Ad";

interface Ad {
  id: number;
  title: string;
  image_url: string;
  tournament_id: number;
}

const Tournament = () => {
  const { id } = useParams<{ id: string }>();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(`/api/tournaments/${id}/ads`);
        setAds(response.data);
      } catch (err) {
        console.error("Ошибка при получении рекламы", err);
      }
    };

    fetchAds();
  }, [id]);

  return (
    <div>
      <TournamentBracket tournamentId={parseInt(id, 10)} />
      <div className="ads-section">
        {ads.map((ad) => (
          <Ad key={ad.id} title={ad.title} imageUrl={ad.image_url} />
        ))}
      </div>
    </div>
  );
};

export default Tournament;