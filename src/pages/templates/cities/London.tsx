import { CityLandingPage } from "../CityLandingPage";

export default function LondonPage() {
  return (
    <CityLandingPage
      citySlug="london"
      cityName="London"
      regionSlug="england"
      regionName="England"
      cityDescription="Find Ofsted-rated fostering agencies in London. The capital has over 500 looked-after children and needs more foster carers across all boroughs."
      localAuthority="Various borough councils"
      whyFosterText="London has one of the highest demands for foster carers in the UK. Agencies here offer competitive rates, excellent training, and 24/7 support. Many children need stable, loving homes across all boroughs."
    />
  );
}