import { SuperClusterAlgorithm, Cluster } from '@googlemaps/markerclusterer';

// Temporary fix for https://github.com/googlemaps/js-markerclusterer/pull/419
export default class BoundingSuperClusterAlgorithm extends SuperClusterAlgorithm {
  cluster({ map }: { map: any }): Cluster[] {
    const bounds = map.getBounds().toJSON();
    const boundingBox = [bounds.west, bounds.south, bounds.east, bounds.north] as [number, number, number, number];

    return this.superCluster
      .getClusters(boundingBox, Math.round(map.getZoom()))
      .map((this.transformCluster as any).bind(this));
  }
}
