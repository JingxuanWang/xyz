#!/usr/bin/perl

use strict;
use Image::Magick;


my $CONFIG = +{
	UNIT_ATK => {
		w => 64,
		h => 64,
		width => 64 * 4,
		height => 64 * 4,
		frame => 4,
		img_num => 151,
		prefix => "Unit_atk_",
		postfix => "-1.bmp",
	},
	UNIT_MOV => {
		w => 48,
		h => 48,
		width => 48 * 3,
		height => 48 * 5,
		frame => 2,
		img_num => 151,
		prefix => "Unit_mov_",
		postfix => "-1.bmp",
	},
	UNIT_SPC => {
		w => 48,
		h => 48,
		width => 48 * 1,
		height => 48 * 6,
		frame => 1,
		img_num => 151,
		prefix => "Unit_spc_",
		postfix => "-1.bmp",
	},

	DIR => "unit",
	OUTPUT_DIR => "output",
};

sub unit_mov {
	my ($config) = @_;

	my $ret;
	my $w = $config->{w};
	my $h = $config->{h};
	my $width = $config->{width};
	my $height = $config->{height};
	my $frame = $config->{frame};
	my $img_num = $config->{img_num};
	my ($type, $side, $level);

	for (my $i = 1; $i <= $img_num; ++$i) {
		my $file = "$CONFIG->{DIR}/$config->{prefix}"
				.$i."$config->{postfix}";

		print STDERR "Processing $file ... \n";

		my $dst = Image::Magick->new;
		$ret = $dst->Read($file);
		warn "$ret\n" if $ret;
		$ret = $dst->Crop(geometry=>"1x1+0+0");
		warn "$ret\n" if $ret;
		$ret = $dst->Resize(width=>$width,height=>$height);
		warn "$ret\n" if $ret;

		my ($sx, $sy) = (0, 0);
		my ($dx, $dy) = (0, 0);
		for (my $l = 0; $l < 3; ++$l) {
		
			$dx = 0;
			$dy = $l * $h;
			$sx = 0;
			$sy = (6 + $l) * $h;
			
			my $src = Image::Magick->new;
			$ret = $src->Read($file);
			warn "$ret\n" if $ret;
			$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
			warn "$ret\n" if $ret;
				
			$ret = $dst->Composite(
				image => $src,
				compose => 'Over',
				x => $dx,
				y => $dy
			);
		

			$dx += $w;
			$sy = $l * 2 * $h;
			for (my $j = 0; $j < $frame; ++$j) {
				my $src = Image::Magick->new;
				$ret = $src->Read($file);
				warn "$ret\n" if $ret;
				$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
				warn "$ret\n" if $ret;
				
				$ret = $dst->Composite(
					image => $src,
					compose => 'Over',
					x => $dx,
					y => $dy
				);
				$dx += $w;
				$sy += $h;
			}
		}


			my $l = 2;		
			$dx = 0;
			$dy = ($l + 1) * $h;
			$sx = 0;
			$sy = (6 + $l) * $h;
			
			my $src = Image::Magick->new;
			$ret = $src->Read($file);
			warn "$ret\n" if $ret;
			$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
			warn "$ret\n" if $ret;
			
			$ret = $src->Flop();
			warn "$ret\n" if $ret;
				
			$ret = $dst->Composite(
				image => $src,
				compose => 'Over',
				x => $dx,
				y => $dy
			);
		

			$dx += $w;
			$sy = $l * 2 * $h;
			for (my $j = 0; $j < $frame; ++$j) {
				my $src = Image::Magick->new;
				$ret = $src->Read($file);
				warn "$ret\n" if $ret;
				$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
				warn "$ret\n" if $ret;
			
				$ret = $src->Flop();
				warn "$ret\n" if $ret;
				
				$ret = $dst->Composite(
					image => $src,
					compose => 'Over',
					x => $dx,
					y => $dy
				);
				$dx += $w;
				$sy += $h;
			}



		$dx = 0;
		$dy = 4 * $h;
		$sx = 0;
		$sy = 9 * $h;
		for (my $j = 0; $j < $frame; ++$j) {
			my $src = Image::Magick->new;
			$ret = $src->Read($file);
			warn "$ret\n" if $ret;
			$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
			warn "$ret\n" if $ret;
			
			$ret = $dst->Composite(
				image => $src,
				compose => 'Over',
				x => $dx,
				y => $dy
			);
			$dx += $w;
			$sy += $h;
		}


		$ret = $dst->Transparent('#F700FF');
		warn "$ret\n" if $ret;

		my $outputPNG = "$CONFIG->{OUTPUT_DIR}/$config->{prefix}".$i.".png";
		$ret = $dst->Write("$outputPNG");
		warn "Write Failed $ret\n" if $ret;
	}

}


sub unit_atk {
	my ($config) = @_;

	my $ret;
	my $w = $config->{w};
	my $h = $config->{h};
	my $width = $config->{width};
	my $height = $config->{height};
	my $frame = $config->{frame};
	my $img_num = $config->{img_num};
	my ($type, $side, $level);

	for (my $i = 1; $i <= $img_num; ++$i) {
		my $file = "$CONFIG->{DIR}/$config->{prefix}"
				.$i."$config->{postfix}";

		print STDERR "Processing $file ... \n";

		my $dst = Image::Magick->new;
		$ret = $dst->Read($file);
		warn "$ret\n" if $ret;
		$ret = $dst->Crop(geometry=>"1x1+0+0");
		warn "$ret\n" if $ret;
		$ret = $dst->Resize(width=>$width,height=>$height);
		warn "$ret\n" if $ret;

		my ($sx, $sy) = (0, 0);
		my ($dx, $dy) = (0, 0);
		for (my $l = 0; $l < 3; ++$l) {
			for (my $j = 0; $j < $frame; ++$j) {
				my $src = Image::Magick->new;
				$ret = $src->Read($file);
				warn "$ret\n" if $ret;
				$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
				warn "$ret\n" if $ret;
				
				$ret = $dst->Composite(
					image => $src,
					compose => 'Over',
					x => $dx,
					y => $dy
				);
				$dx += $w;
				$sy += $h;
			}
			$dx = 0;
			$dy += $h;
		}

			$sy -= $frame * $h;
			# flip left to right
			for (my $j = 0; $j < $frame; ++$j) {
				my $src = Image::Magick->new;
				$ret = $src->Read($file);
				warn "$ret\n" if $ret;
				#warn "$w - $h - $sx - $sy \n";
				$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
				warn "$ret\n" if $ret;
			
				# flip here
				$ret = $src->Flop();
				warn "$ret\n" if $ret;

				$ret = $dst->Composite(
					image => $src,
					compose => 'Over',
					x => $dx,
					y => $dy
				);
				$dx += $w;
				$sy += $h;
			}

		$ret = $dst->Transparent('#F700FF');
		warn "$ret\n" if $ret;

		my $outputPNG = "$CONFIG->{OUTPUT_DIR}/$config->{prefix}".$i.".png";
		$ret = $dst->Write("$outputPNG");
		warn "Write Failed $ret\n" if $ret;
	}

}

sub unit_spc {
	my ($config) = @_;

	my $ret;
	my $w = $config->{w};
	my $h = $config->{h};
	my $width = $config->{width};
	my $height = $config->{height};
	my $frame = $config->{frame};
	my $img_num = $config->{img_num};
	my ($type, $side, $level);

	for (my $i = 1; $i <= $img_num; ++$i) {
		my $file = "$CONFIG->{DIR}/$config->{prefix}"
				.$i."$config->{postfix}";

		print STDERR "Processing $file ... \n";

		my $dst = Image::Magick->new;
		$ret = $dst->Read($file);
		warn "$ret\n" if $ret;
		$ret = $dst->Crop(geometry=>"1x1+0+0");
		warn "$ret\n" if $ret;
		$ret = $dst->Resize(width=>$width,height=>$height);
		warn "$ret\n" if $ret;

		my ($sx, $sy) = (0, 0);
		my ($dx, $dy) = (0, 0);

		# first three images
		my $src = Image::Magick->new;
		$ret = $src->Read($file);
		warn "$ret\n" if $ret;
		$ret = $src->Crop(geometry=>$w."x".($h * 3)."+".$sx."+".$sy);
		warn "$ret\n" if $ret;
		$ret = $dst->Composite(
			image => $src,
			compose => 'Over',
			x => $dx,
			y => $dy
		);
		$sy += 2 * $h;
		$dy += 3 * $h;

		my $src = Image::Magick->new;
		$ret = $src->Read($file);
		warn "$ret\n" if $ret;
		$ret = $src->Crop(geometry=>$w."x".$h."+".$sx."+".$sy);
		warn "$ret\n" if $ret;
		$ret = $src->Flop();
		warn "$ret\n" if $ret;
		
		$ret = $dst->Composite(
			image => $src,
			compose => 'Over',
			x => $dx,
			y => $dy
		);
		$sy += $h;
		$dy += $h;

		my $src = Image::Magick->new;
		$ret = $src->Read($file);
		warn "$ret\n" if $ret;
		$ret = $src->Crop(geometry=>$w."x".($h * 2)."+".$sx."+".$sy);
		warn "$ret\n" if $ret;
		$ret = $dst->Composite(
			image => $src,
			compose => 'Over',
			x => $dx,
			y => $dy
		);


		$ret = $dst->Transparent('#F700FF');
		warn "$ret\n" if $ret;

		my $outputPNG = "$CONFIG->{OUTPUT_DIR}/$config->{prefix}".$i.".png";
		$ret = $dst->Write("$outputPNG");
		warn "Write Failed $ret\n" if $ret;
	}

}


unit_atk($CONFIG->{UNIT_ATK});
unit_mov($CONFIG->{UNIT_MOV});
unit_spc($CONFIG->{UNIT_SPC});
