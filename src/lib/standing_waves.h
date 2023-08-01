#ifndef LIB_STANDING_WAVES_H
#define LIB_STANDING_WAVES_H

#include <Eigen/Core>
#include <Eigen/SparseCore>
#include <utility>

namespace standing_waves {

using SparseMatrix =  Eigen::SparseMatrix<double>;
using EigenPairs = std::vector<std::pair<double, Eigen::MatrixXd>>;
using Triplet = Eigen::Triplet<double>;

/**
 * @return the Laplacian for a k x m x n hexagonal tiling.
 *
 * @param k The number of hexagons in the x direction.
 * @param m The number of hexagons in the top left direction.
 * @param n The number of hexagons in the top right direction.
 */
SparseMatrix hex_laplacian(int k, int m, int n);

/**
 * @return the Laplacian for a w x h rectangular tiling.
 */
SparseMatrix rect_laplacian(int w, int h);

/**
 * @return the `top_n` eigenvalues and eigenvectors of the given Laplacian.
 */
EigenPairs standing_waves(const SparseMatrix &laplacian, int top_n);

} // namespace standing_waves

#endif // LIB_STANDING_WAVES_H
