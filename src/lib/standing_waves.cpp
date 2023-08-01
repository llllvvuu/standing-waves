#include "standing_waves.h"

#include <Eigen/Core>
#include <Eigen/Sparse>
#include <Eigen/SparseCore>
#include <Spectra/MatOp/SparseSymMatProd.h>
#include <Spectra/SymEigsSolver.h>
#include <algorithm>
#include <cstdlib>
#include <utility>

namespace standing_waves {

SparseMatrix hex_laplacian(int k, int m, int n) {
  int short_side = std::min(m, n);
  int max_width = k + short_side - 1;
  int n_hexes_middle = (abs(m - n) - 1) * max_width;
  int n_hexes_top_and_bottom = short_side * (k + max_width);
  int n_hexes = n_hexes_middle + n_hexes_top_and_bottom;

  SparseMatrix A(n_hexes, n_hexes);
  std::vector<int> degree(n_hexes, 0);
  std::vector<Triplet> triplets;

  int prev_left = 0, prev_right = 0;
  int left = 0, right = 2 * (k - 1);
  int offset = 0, prev_offset = 0;
  for (int y = 0; y < m + n - 1; y++) {
    int left_offset = offset;
    for (int x = left; x <= right; x += 2) {
      if (y > 0) {
        int bottom_left = left > prev_left ? prev_offset : prev_offset - 1;
        int bottom_right = left > prev_left ? prev_offset + 1 : prev_offset;
        if (x > prev_left) {
          triplets.push_back(Triplet(offset, bottom_left, -1));
          triplets.push_back(Triplet(bottom_left, offset, -1));
          degree[offset]++;
          degree[bottom_left]++;
        }
        if (x < prev_right) {
          triplets.push_back(Triplet(offset, bottom_right, -1));
          triplets.push_back(Triplet(bottom_right, offset, -1));
          degree[offset]++;
          degree[bottom_right]++;
        }
        prev_offset++;
      }
      if (x > left) {
        triplets.push_back(Triplet(offset, offset - 1, -1));
        triplets.push_back(Triplet(offset - 1, offset, -1));
        degree[offset]++;
        degree[offset - 1]++;
      }
      offset++;
    }
    prev_offset = left_offset;
    prev_left = left, prev_right = right;
    left = y + 1 < m ? prev_left - 1 : prev_left + 1;
    right = y + 1 < n ? prev_right + 1 : prev_right - 1;
  }
  for (int i = 0; i < n_hexes; i++) {
    triplets.push_back(Triplet(i, i, degree[i]));
  }
  A.setFromTriplets(triplets.begin(), triplets.end());
  return A;
}

SparseMatrix rect_laplacian(int w, int h) {
  const int n = w * h;
  SparseMatrix laplacian(n, n);
  std::vector<Triplet> coefficients;

  for (int i = 0; i < w; ++i) {
    for (int j = 0; j < h; ++j) {
      const int index = i + j * w;
      int degree = 0;
      if (i > 0) {
        coefficients.push_back(Triplet(index, index - 1, -1));
        degree++;
      }
      if (j > 0) {
        coefficients.push_back(Triplet(index, index - w, -1));
        degree++;
      }
      if (i < w - 1) {
        coefficients.push_back(Triplet(index, index + 1, -1));
        degree++;
      }
      if (j < h - 1) {
        coefficients.push_back(Triplet(index, index + w, -1));
        degree++;
      }
      coefficients.push_back(Triplet(index, index, degree));
    }
  }

  laplacian.setFromTriplets(coefficients.begin(), coefficients.end());
  return laplacian;
}

EigenPairs standing_waves(const Eigen::SparseMatrix<double> &laplacian,
                          int top_n) {
  if (top_n == -1) top_n = laplacian.rows() - 1;
  Spectra::SparseSymMatProd<double> op(laplacian);
  Spectra::SymEigsSolver<Spectra::SparseSymMatProd<double>> eigs(
      op, top_n, std::min(2 * top_n + 1, (int)laplacian.rows()));

  eigs.init();
  eigs.compute(Spectra::SortRule::LargestMagn);
  if (eigs.info() != Spectra::CompInfo::Successful)
    throw std::runtime_error("Eigenvalue computation did not converge.");

  Eigen::VectorXd evalues = eigs.eigenvalues();
  Eigen::MatrixXd evectors = eigs.eigenvectors();

  EigenPairs eigen_pairs(top_n);
  for (int i = 0; i < top_n; i++) {
    eigen_pairs[i] = std::make_pair(evalues[i], evectors.col(i));
  }

  return eigen_pairs;
}

} // namespace standing_waves
