#!/usr/bin/perl

use strict;
use warnings;

use Data::Dumper;
use List::Util;

my $DIR = "image/output/";
my $FILE = "vector.txt";

sub parse_vector {
	my ($filename) = @_;
	
	chomp($filename);
	
	print $filename,"\n";
	if ($filename =~ /^r:(\d+), g:(\d+), b:(\d+).png$/) {
		return +[$1, $2, $3];	
	}
}

sub get_vectors {
	my @filenames = `ls $DIR`;
	my @vectors = map { parse_vector($_) } @filenames;
	return \@vectors;
}

sub read_vectors {
	open FILE, "<$FILE" or die "Can not open file";

	my @vectors;
	while(my $line = <FILE>) {
		chomp($line);
		my ($r, $g, $b) = split(" ", $line);
		push @vectors, +[$r, $g, $b];
	}

	return \@vectors;
}

sub dump_vectors {
	my ($vectors) = @_;

	open FILE, ">$FILE" or die "Can not open file";

	for my $vector (@$vectors) {
		print FILE "$vector->[0] $vector->[1] $vector->[2]\n";1
	}

	close FILE;
}

sub kmeans {
	my ($cluster_num, $vectors) = @_;

	# 1, generate seed vectors
	my ($min, $max) = (5000, 15536);

	my @seeds = 1..$cluster_num;
	my @clusters;
	srand();

	@seeds = map { +[int(rand($max)), int(rand($max)), int(rand($max))] } @seeds;

	my $round = 0;
	while(1 && $round++ < 10) {
		print "Round : $round \n";

		@clusters = map { +[] } @seeds;

		# 2, partition all vectors according to seed
		for my $vector (@$vectors) {
			_partition($vector, \@seeds, \@clusters);
		}

		# 3, calculate all regions' mean position
		my $means = _calc_mean(\@clusters);

		# 4, if there is difference between seed's position and region's mean position
		unless (_should_continue(\@seeds, $means, 100)) {
			last;
		}

		# move the seed's position to mean position and repeat 2
		# make means to be new seeds

		#print Dumper $means;
	}

	# 5 output each vectors in by regions
	#print Dumper @clusters;
}

sub _should_continue {
	my ($seeds, $means, $threshold) = @_;

	if (scalar(@$seeds) != scalar(@$means)) {
		die "length didn't match";
	}

	my $ret = 0;
	for (my $i = 0; $i < @$seeds; $i++) {
		my $seed = $seeds->[$i];
		my $mean = $means->[$i];

		if (_distance($seed, $mean) > $threshold) {
			unless ($mean->[0] == 0 && $mean->[1] == 0 && $mean->[2] == 0) {
				$seeds->[$i] = _interpolate($seed, $mean, 0.5);
			}
			$ret |= 1;
		}
		else {
		}
	}

	return $ret;
}

sub _calc_mean {
	my ($clusters) = @_;

	my @means;
	for my $cluster (@$clusters) {
		my $mean = +[0, 0, 0];

		if (scalar(@$cluster) > 0) {
			for (my $i = 0; $i < scalar(@$cluster); $i++) {
				$mean->[0] += $cluster->[$i]->[0];	
				$mean->[1] += $cluster->[$i]->[1];	
				$mean->[2] += $cluster->[$i]->[2];	
			}

			$mean->[0] = int($mean->[0] / (scalar(@$cluster)));	
			$mean->[1] = int($mean->[1] / (scalar(@$cluster)));	
			$mean->[2] = int($mean->[2] / (scalar(@$cluster)));	
		}

		push @means, $mean;
	}

	return \@means;
}

sub _partition {
	my ($vector, $seeds, $clusters) = @_;

	my $min_index = 0;
	my $min_dist = 0;
	for (my $i = 0; $i < scalar(@$seeds); $i++) {
		my $seed = $seeds->[$i];
		my $dist = _distance($vector, $seed);
		if (!$min_dist || $min_dist < $dist) {
			$min_dist = $dist;
			$min_index = $i;
		}	
	}

	push (@{$clusters->[$min_index]}, $vector);
}

sub _distance {
	my ($src, $dst) = @_;

	return sqrt(
		($src->[0] - $dst->[0]) * ($src->[0] - $dst->[0]) + 
		($src->[1] - $dst->[1]) * ($src->[1] - $dst->[1]) + 
		($src->[2] - $dst->[2]) * ($src->[2] - $dst->[2]) 
	);
}

sub _interpolate {
	my ($src, $dst, $a) = @_;

	print "Seed : ($src->[0], $src->[1], $src->[2]) | Mean : ($dst->[0], $dst->[1], $dst->[2])\n";

	return +[
		int($src->[0] * $a + $dst->[0] * (1 - $a)),
		int($src->[1] * $a + $dst->[1] * (1 - $a)),
		int($src->[2] * $a + $dst->[2] * (1 - $a)),
	];
}

sub main {
	#my $vectors = get_vectors();

	#dump_vectors($vectors);
	
	my $vectors = read_vectors();
	
	kmeans(4, $vectors);

}

&main();
