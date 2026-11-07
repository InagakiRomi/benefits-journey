package com.collection.benefitsjourney.dto.CinemaMovie;

import java.util.List;

import com.collection.benefitsjourney.domain.CinemaBean;
import com.collection.benefitsjourney.dto.InventoryStatusResponse;
import com.collection.benefitsjourney.enums.County;

/** 前台影城探索卡片需要的欄位；特典明細與地圖使用同一份查詢結果 */
public record CinemaExploreResponse(
        Integer cinemaId,
        String cinemaName,
        County county,
        String cinemaAddress,
        String officialWebsiteUrl,
        int benefitCount,
        List<InventoryStatusResponse> benefits) {

    public static CinemaExploreResponse from(
            CinemaBean cinema,
            List<InventoryStatusResponse> benefits) {

        List<InventoryStatusResponse> safeBenefits = benefits == null
                ? List.of()
                : List.copyOf(benefits);

        return new CinemaExploreResponse(
                cinema.getCinemaId(),
                cinema.getCinemaName(),
                cinema.getCounty(),
                cinema.getCinemaAddress(),
                cinema.getOfficialWebsiteUrl(),
                safeBenefits.size(),
                safeBenefits);
    }
}
