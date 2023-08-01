#include "../lib/standing_waves.h"
#include <iostream>
#include <string>

void print_usage() {
  std::cout << "Usage:\n";
  std::cout << "hex k m n top_n : Compute top_n standing waves for k x m x n "
               "hexagonal tiling.\n";
  std::cout << "rect w h top_n : Compute top_n standing waves for w x h "
               "rectangular tiling.\n";
}

/** Prints in JSON format. */
void print_waves(const standing_waves::EigenPairs &waves) {
  std::cout << "[\n";
  for (const auto &pair : waves) {
    std::cout << "  {\n";
    std::cout << "    \"eigenvalue\": " << pair.first << ",\n";
    std::cout << "    \"eigenvector\": [";
    for (int i = 0; i < pair.second.size(); ++i) {
      if (i > 0)
        std::cout << ", ";
      std::cout << pair.second(i);
    }
    std::cout << "]\n  },\n";
  }
  std::cout << "]\n";
}

int main(int argc, char **argv) {
  if (argc < 2) {
    std::cout << "Invalid arguments. Please provide a subcommand.\n";
    print_usage();
    return 1;
  }
  std::string command = argv[1];
  try {
    if (command == "hex" && argc == 6) {
      int k = std::stoi(argv[2]);
      int m = std::stoi(argv[3]);
      int n = std::stoi(argv[4]);
      int top_n = std::stoi(argv[5]);
      auto laplacian = standing_waves::hex_laplacian(k, m, n);
      auto waves = standing_waves::standing_waves(laplacian, top_n);
      print_waves(waves);
    } else if (command == "rect" && argc == 5) {
      int w = std::stoi(argv[2]);
      int h = std::stoi(argv[3]);
      int top_n = std::stoi(argv[4]);
      auto laplacian = standing_waves::rect_laplacian(w, h);
      auto waves = standing_waves::standing_waves(laplacian, top_n);
      print_waves(waves);
    } else {
      std::cout << "Invalid command.\n";
      print_usage();
      return 1;
    }
  } catch (const std::invalid_argument &ia) {
    std::cerr << "Invalid argument: " << ia.what() << '\n';
    print_usage();
    return 1;
  }
  return 0;
}
