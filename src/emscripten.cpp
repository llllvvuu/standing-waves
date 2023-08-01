#include "lib/matching_pursuit.h"
#include "lib/standing_waves.h"
#include <cmath>
#include <emscripten/bind.h>
#include <iostream>

using namespace emscripten;
using namespace standing_waves;

/**
 * @return flat data layout: row, col, triples
 */
std::vector<double> sparseMatrixToVec(const SparseMatrix &mat) {
  std::vector<double> arr(2 + mat.nonZeros() * 3);
  std::vector<double>::iterator it = arr.begin();

  *it++ = mat.rows();
  *it++ = mat.cols();
  int outerSize = mat.outerSize();
  for (int k = 0; k < outerSize; ++k) {
    for (SparseMatrix::InnerIterator jt(mat, k); jt; ++jt) {
      *it++ = jt.row();
      *it++ = jt.col();
      *it++ = jt.value();
    }
  }

  return arr;
}

/**
 * @param data flat data layout: row, col, triples
 */
SparseMatrix vecToSparseMatrix(std::vector<double> vec) {
  std::vector<Eigen::Triplet<double>> triplets(vec.size() / 3);
  std::vector<double>::const_iterator it = vec.begin();
  std::vector<Eigen::Triplet<double>>::iterator jt = triplets.begin();
  int rows = round(*it++);
  int cols = round(*it++);

  while (it != vec.end()) {
    int row = round(*it++);
    int col = round(*it++);
    int value = *it++;
    *jt++ = Eigen::Triplet<double>(row, col, value);
  }

  SparseMatrix mat(rows, cols);
  mat.setFromTriplets(triplets.begin(), triplets.end());

  return mat;
}

/**
 * @return JSON [{ eigenvalue: number, eigenvector: number[] }]
 */
emscripten::val eigenPairsToObject(const EigenPairs &pairs) {
  emscripten::val result = emscripten::val::array();
  result.set("size", pairs.size());

  int i = 0;
  for (const auto &pair : pairs) {
    emscripten::val eigenpair = emscripten::val::object();
    eigenpair.set("eigenvalue", pair.first);
    emscripten::val eigenvector = emscripten::val::array();
    eigenvector.set("size", pair.second.size());
    for (int i = 0; i < pair.second.size(); ++i) {
      double elem = pair.second(i);
      eigenvector.set(i, elem);
    }
    eigenpair.set("eigenvector", eigenvector);
    result.set(i++, eigenpair);
  }

  return result;
}

std::vector<double> hex_laplacian_wrapper(int k, int m, int n) {
  return sparseMatrixToVec(hex_laplacian(k, m, n));
}

std::vector<double> rect_laplacian_wrapper(int w, int h) {
  return sparseMatrixToVec(rect_laplacian(w, h));
}

emscripten::val standing_waves_wrapper(std::vector<double> laplacian,
                                       int top_n) {
  return eigenPairsToObject(
      standing_waves::standing_waves(vecToSparseMatrix(laplacian), top_n));
}

/**
 * @param vecs - emscripten::val::array of emscripten::val::array
 * @param i - the target vector y is the one-hot vector with 1 at index i
 * @return emscripten::val::array of emscripten::val::object
 *         { index: number, coefficient: number } for each nonzero coefficient
 */
emscripten::val omp_wrapper(emscripten::val vecs_val, int i, int N) {
  int size = vecs_val["length"].as<int>();
  std::vector<Eigen::VectorXd> vecs(size);

  // Convert JavaScript array to std::vector of Eigen::VectorXd
  for (int j = 0; j < size; ++j) {
    emscripten::val vec_val = vecs_val[j];
    int vec_size = vec_val["length"].as<int>();
    Eigen::VectorXd vec(vec_size);

    for (int k = 0; k < vec_size; ++k) {
      vec(k) = vec_val[k].as<double>();
    }

    vecs[j] = vec;
  }

  // Build matrix X
  Eigen::MatrixXd X(vecs[0].size(), size);
  for (int j = 0; j < size; ++j) {
    X.col(j) = Eigen::VectorXd::Map(vecs[j].data(), vecs[j].size());
  }

  // Build target vector y
  Eigen::VectorXd y = Eigen::VectorXd::Zero(vecs[0].size());
  y(i) = 1;

  // Call omp
  Eigen::VectorXd theta = omp(X, y, N);

  // Convert result to JavaScript array
  emscripten::val result = emscripten::val::array();
  for (int j = 0; j < theta.size(); ++j) {
    if (std::abs(theta(j)) > 1e-5) { // Ignore small coefficients
      emscripten::val coeff = emscripten::val::object();
      coeff.set("index", j);
      coeff.set("coefficient", theta(j));
      result.call<void>("push", coeff);
    }
  }

  return result;
}

EMSCRIPTEN_BINDINGS(standing_waves_lib) {
  register_vector<double>("VectorDouble");
  function("hex_laplacian", &hex_laplacian_wrapper, allow_raw_pointers());
  function("rect_laplacian", &rect_laplacian_wrapper, allow_raw_pointers());
  function("standing_waves", &standing_waves_wrapper, allow_raw_pointers());
  function("omp", &omp_wrapper, allow_raw_pointers());
}
